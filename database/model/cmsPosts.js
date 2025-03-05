const mongoose = require("mongoose");
const { Schema } = mongoose;

const cmsPostSchema = new Schema({
    title: { type: String, required: true },
    image: { type: String, default:null}, // Storing GridFS file ID
    postType: { type: String }
}, { timestamps: true });

const CmsPost = mongoose.model("CmsPost", cmsPostSchema);
module.exports = CmsPost;


