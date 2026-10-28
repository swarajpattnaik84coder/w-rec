import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        targetType: {
            type: String,
            required: true,
            enum: ["Videos", "Tweets", "Comments", "Video", "Tweet", "Comment"]
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "targetType"
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate likes by the same user on the same target. it applie sindexing to each document and prevents duplication or multiple like same user on single video/tweet
likeSchema.index({ owner: 1, targetId: 1, targetType: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

export {Like};
