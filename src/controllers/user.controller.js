import {asyncHandler} from "../utils/asyncHandlers.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

//access and refresh token multiple times generate karna padega, so ek method banalo
const generateAccessAndRefreshToken = async(userId)=>{
    try{const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save( {validateBeforeSave: false} )
    return { accessToken, refreshToken};
}catch(error){
    console.log(error)
    throw new ApiError(500,"Something went wrong while generating access and refresh token")
}
}

const registerUser = asyncHandler(async (req,res) => {
    //get user details from frontend //* DONE
    //validation - not empty //* DONE
    // check if user already exsts: username, email //* DONE
    // check for images check for avatar //* DONE
    //upload them to cloudinary //* DONE
    //create user object - create entry in db //* DONE
    // remove password and refresh token field from response //* DONE
    //check for user creation //* DONE
    // return res //* DONE





    //! request se data extract karo
    const {fullName, email, username, password} = req.body 
    //*const fullName = req.body.fullName;
    //* const email = req.body.email;
    //*const username = req.body.username;
    //*const password = req.body.password;
    // console.log("email: ",email);
    // console.log("username: ",username);
    // console.log("password: ",password);
    // console.log("fullName: ",fullName);
    //console.log("\ntest request: ",req)
    //console.log("\ntest request.body: ",req.body)
    //console.log("\ntest request.files: ",req.files)


    //! check karo ki sare fields valid hai
    if( // fields ka array banake uspe operations karo
        [fullName, email, username, password].some((field) => {
            return (field?.trim() === "")
        })
    ){
        throw new ApiError(400,"all field are required")
    }

    //! check karo ki user already exists
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        /* Agar use koi ek bhi aisi cheez mil gayi (chahe sirf username match ho jaye, chahe sirf email), toh wo us user ka poora data return kar dega. Aur agar return me data mila, toh aap turant error phek denge ki "User with this email or username already exists!" */
        throw new ApiError(409,"user already exists");
    }

    //! fiels ka local path extract karo
    let avatarLocalPath;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;


    //console.log("\ncoverImageLocalPath: ",coverImageLocalPath)

    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        //console.log("\navater exists")
        avatarLocalPath = req.files?.avatar?.[0]?.path; 
        //console.log("\navatar path exists");
    }
    //console.log("\navatarLocalPath: ",avatarLocalPath)
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    //! cloudinary pe upload

    //console.log("uploading avatar from: ",avatarLocalPath)
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    //console.log("cloudinary response of avatr: ",avatar);

   // console.log("uploading coverImage from: ",coverImageLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //console.log("cloudinary response of coverImage: ",coverImage);

    if(!avatar){    //! check karo avatar nahi raha on database
        throw new ApiError(400,"Avatar file is required");
    }

    const user = await User.create({  
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })
    //console.log("user: ",user)
    //! check user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //? kya kya nahi chaiye
    )
    if(!createdUser){
        throw new ApiError(500,"Smething went wrong in registeration");
    }
    //console.log("CREATED USER:",createdUser);
    //! frontend pe response ya message bhejo
    return res.status(201).json(
        new ApiResponse(201,createdUser,"user registered successfuly",)
    )




})


const loginUser = asyncHandler(async (req,res) => {
    
    //workflow //* done
    //request.body -> data //* done
    //username/email //* done
    //find the user //* done
    //password verify //* done
    // access or refresh token //* done
    //response to user/ cookies //* done

    const {email,username,password} = req.body;

    if(!username && !email){
        throw new ApiError(400,"either of username or email is required");
    }


    const user = await User.findOne({
        $or: [{username},{email}]   // todo: in mongoose db find user either by username or email
    })
    if(!user){
        throw new ApiError(404,"user does not exist");
    }
//todo: now if user is present validate the entered password
    const isUserValid = await user.isPasswordCorrect(password)
//todo: ab login hogaya hai, ab kam suru hota hai refresh token and access tokens ka
    //acess token and refresh token ko save karo
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

//todo: token generate ho gaya hai, yani user officially and technicalyy logged in hai, so user ko bhi batado ki wo logged in hai
    // abhi user ko frontend pe data bhejna hai
    const loggedInUser = await User.findById(user._id) //! why again findOne on User? can't operte on user? we already have user as 

    .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)  //! cookies kyun use hua
    .cookie("accessToken",accessToken,options)  //todo: token data as cookies user ke device mein store hoga
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{user: loggedInUser, accessToken, refreshToken  }, message ="User Logged In successfuly")
        //todo: user ko data bhejdo

)
})

const logoutUser = asyncHandler(async(req,res) => {
// workflow
// logout click
// /logout par post request
// remove token from database
// delete cookies from browser
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: refreshToken = undefined //todo: yahi pe dat change ho raha hai
        },
        {
            new: true   //todo: jo updated data hai, usa bhejo, na ki previous data ko
        }
    )
    
    const options = {
        httpOnly: true, //todo: cookies ko frontend ki js nahi paqdh shakti, only server can access/read
        secure: true    //todo: forces cookies to travel on secure https path only
    }
        return res
        .status(200)
        .clearCookie("refreshToken",options)//todo: Suno Browser, is user ke paas jo refreshToken aur accessToken naam ki cookies hain, unhe kachre mein daal do (delete kar do).
        .clearCookie("accessToken",options)
        .json(new ApiResponse(200,{},"User Logged Out Successfully"))

})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = Request.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
        )
          console.log(decodedToken);
        const user = await User.findById(decodedToken._id);

        if(!user){
          
            throw new ApiError(401,"invalid refresh token")
        }
        if(user?.refreshToken !== incomingRefreshToken){
            throw new ApiError(401,"refresh token invalid or used");
        }
        const option = {
            httpOnly: true,
            secure: true
        }

        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id);

        return res 
        .status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",newRefreshToken,option)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshToken}
            )
        )
    }
    catch(error){
        throw new ApiError(
            401,
            error?.message || "invalid refresh token"
        )
    }
})
    

const changePassword = asyncHandler(async (req,res)=> {
    const {oldPassword, newPassword, confirmPassword} = req.body

    if(!(newPassword == confirmPassword)){
        throw ApiError(400, "confirm password error")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"invalid password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: flase})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"passo=word changed successfully"))

})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(200, req.user, "user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName} = req.body

    if(!fullName){
        throw ApiError(400,"field value empty")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {$set:
            fullName
        },
        {new: true}// after updation also updates the user in 293rd line
    ).select(-password)
    return res
.status(200)
.json(new ApiResponse(200,{user},"details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req,res) => {    
    const user = req.user;
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file reuired")
    }

    //todo: delete previous avatar

const avatarURL = new URL(user.avatar);

const parts = avatarURL.pathname.split("/upload/")[1].split("/");

if (parts[0].startsWith("v") && /^v\d+$/.test(parts[0])) {
    parts.shift();
}

const publicId = parts.join("/").replace(/\.[^/.]+$/, "");

//console.log(publicId);
//? create dnew utility for cloudinary deletion
    await deleteFromCloudinary(publicId)


    //todo: update new avatar

    const avatar =  await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw ApiError(400,"error while uploading avatar")
    }


    user.avatar = avatar.url;
    await user.save();

     const safeUser = user.toObject();
    delete safeUser.password;

    return res
    .status(200)
    .json(new ApiResponse(200,safeUser,"avatar updated successfully"));

});

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment

    const coverImageURL = new URL(user.coverImage);
const parts = coverImageURL.pathname.split("/upload/")[1].split("/");
if (parts[0].startsWith("v") && /^v\d+$/.test(parts[0])) {
    parts.shift();
}
const publicId = parts.join("/").replace(/\.[^/.]+$/, "");
//console.log(publicId);
    await deleteFromCloudinary(publicId)

    //todo: upload new cover image
const user = await User.findById(req.user._id)



    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

//* mongo aggregation concept starts from here 

    const getChannelProfile = asyncHandler( async(req,res) => {
        const {username} = req.params
        if(!username?.trim()){
            throw new ApiError(400,"username is missing")
        }

        const channel = await User.aggregate([
            {
                $match:{
                    username: username?.lowercase()
                }
            },
            {   //TODO: get subscriber count
                $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as:"subscribers"
                }
            },
            {   //TODO: get count of channel subscribed to 
                $lookup:{
                    from: "subscriptions",
                    localField:"id_",
                    foreignField:"subscriber",
                    as:"subscribedTo"
                }
            },
            {
                $addFields:{
                    subscriberCount:{
                        $size: "$subscribers"
                    },
                  channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },  
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
                }
            },
            {
                $project:{
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1,
                    subscriberCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1
                }
            }
        ])

        if(!channel?.length){
            throw new ApiError(400,"channel does not exist")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,channel[0],"channel retrived successfuly")
        )
    })

    //* sub pipline concept starts here

    const getWatchHistory = asyncHandler(async(req,res) => {
        const user = await User.aggregate([
            {
                $match: new mongoose.Types.ObjectId(req.user._id)
            },
            {//? foreignField belongs to from: collection
                $lookup:{
                    from:"videos",
                    localField: "watchHistory",
                    foreignField:  "_id", //_id is implicit id of videos given by mongo db
                    as: "watchHistory",
                    pipeline:[
                        {
                            $lookup: {
                                from: "users",
                                localField:"owner",
                                foreignField: "_id",
                                as:"owner",
                                pipeline:[
                                    {
                                        $project:{
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                    }
                                }
                                ]

                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    owner: {
                        $first: "$owner"// retrives only the 0th index of owner array 
                    }
                }
            }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(200,user[0].getWatchHistory,"watch history fetched successfully")
        )
    })

export {registerUser, 
    loginUser, 
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getChannelProfile,
    getWatchHistory
}
