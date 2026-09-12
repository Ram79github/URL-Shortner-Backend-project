import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    shortId: {
        type:String,
        required:true,
        unique:true,
    },
    redirectURL: {
        type:String,
        required:true,
        unique:true,
        index:true
    },
    visitHistory: [{
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: true
    }

}, { timestamps: true });

const URL = mongoose.model("url", urlSchema);
export { URL };