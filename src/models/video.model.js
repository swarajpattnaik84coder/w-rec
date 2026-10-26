import mongoose, {Schema} from 'mongoose'

const videoSchema = new Schema({
    videoFile:{
        type: String, // url from cloudynary
        required: true
    },
    thumbnail:{
        type: String, // url from cloudynary
        required: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    title:{
        type: String,
        required: true
    },
     description:{
        type: String, 
        required: true
    },
    duration:{
        type: String,
        required: true
    },
    views:{
        type: Number,
        required: true,
        default: 0
    },
    isPublished:{
        type: Boolean,
        required: true,
        default: true
    },
    
},{timestamps: true})

const Video = mongoose.model("Video", videoSchema)
export { Video, Video as Videos }