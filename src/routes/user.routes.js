import {Router} from "express"
import {loginUser, registerUser,logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getChannelProfile, getWatchHistory} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
const router = Router()

router.route("/register").post(

    //! middleware chaiye to likhna padega, yahan file upload hoga, phir wo uploaded file controllers ke pas jayega for further operations
    upload.fields([
        {name: "avatar",
            maxCount: 1
        },
        {name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

    router.route("/login").post(loginUser)

    router.route("/logout").post(verifyJWT, logoutUser) //todo: (middleware, method)
    //? next iseliye use hota hai taki confusion na ho ki pehla verifyJWT ke bd kya karna hai? next bolta hai ki next middleware ko chale jao yani-> logoutUser

    router.route("/refreshAccessToken").post(refreshAccessToken)

    router.route("/change-password").post(verifyJWT,changePassword)
    router.route("/get-user").get(verifyJWT,getCurrentUser)
    router.route("/update-acc-details").patch(verifyJWT,updateAccountDetails)

    router.route("/avatar").patch(verifyJWT,upload.single(
        "avatar"
    ),updateUserAvatar)
    router.route("/coverImage").patch(verifyJWT,upload.single(
        "coverImage"
    ),updateUserCoverImage)

    router.route("/c/:username").get(verifyJWT,getChannelProfile)    //? special syntax for params. we are retriving username from params so :username
    router.route("/history").get(verifyJWT,getWatchHistory)

export default router