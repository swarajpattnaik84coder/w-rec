import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import { ApiError } from './apiError.js';

cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        //* uploads file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type: "auto"
    })
    //* file has been uploaded
    console.log("file uploaded successfully on cloudinary", response.url);
    //console.log("cloudinary response: ",response);
    return response;
    }
    catch(error){
        console.log(error);
        fs.unlinkSync(localFilePath) // remove the locally saved dile
        console.log("file upload unsuccessful on cloudinary");
        return null;
    }
}

const deleteFromCloudinary = async(publicId) => {
    if(!publicId) throw null

    return await cloudinary.uploader.destroy(publicId)
};

export {uploadOnCloudinary,
    deleteFromCloudinary
}



