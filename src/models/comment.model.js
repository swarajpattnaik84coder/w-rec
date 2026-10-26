import mongoose, {Schema} from "mongoose";
import { Videos } from "./video.model.js";

const commentSchema = new mongoose.Schema({
    
    content:{
        type: String,
        required: true,
        trim: true
    },

    owner:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,

    },
   
    targetType:{
        type: String,
        required: true,
        enum : ["Videos", "Tweets"]
    },

    targetId:{
        type: mongoose.Types.ObjectId,
        required: true,
        refPath: "targetType"
    }

},
{
    timestamps: true
})

const Comment = mongoose.model("Comment", commentSchema)
export { Comment, Comment as Comments }