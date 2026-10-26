import jwt from "jsonwebtoken"; // <-- Bonus: Ye import zaroori hai jwt.verify() chalane ke liye
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandlers.js";

//todo:
/* user logout request dalta hai -> middleware verify user karta hai 
-> agar user verified hai to middleware usi request mein ek naya field user add krdeta hai,
 us user field mein user ka dat hota hai 
 -> controller is request se user field ko extract karke baki kam karta hai yani logoutUser execute karta hai. */
export const verifyJWT = asyncHandler(async(req, res, next) => {

    try {
        // 1. Browser cookies ya Mobile app (Headers) se Token (Ticket) nikalna
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // 2. Agar user bina token (ticket) ke aaya hai, toh access rok do
        if(!token){
            throw new ApiError(401, "Unauthorized request");
        }

        // 3. Token ko Secret Key (Mohar) se check karna aur andar ka data (payload) kholna
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 4. Token wali '_id' se Database mein user dhoondhna (password hide karke)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        // 5. Agar token sahi hai par user DB me nahi mila (maybe delete ho gaya ho), toh error
        if(!user){
            throw new ApiError(401, "Invalid access token");
        }

        // 6. MAIN STEP: Request (req) ke upar user ka data (sticker) chipka dena
        req.user = user;

        // 7. Darwaza kholna: Ab request ko aage Controller (logoutUser) ke paas jane do
        next();
        
    } catch(error) {
        // 8. Agar token Nakli (fake) ya Expire ho gaya ho, toh server crash hone se bachana
        throw new ApiError(401, "Invalid access token");
    }
})