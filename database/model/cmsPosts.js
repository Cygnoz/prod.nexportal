const mongoose = require("mongoose");
const { Schema } = mongoose;

const cmsPostSchema = new Schema({
    title: { type: String },
    image: { type: String, }, // Storing GridFS file ID
    postType: { type: String },
    link:{type:String}
}, { timestamps: true });

const CmsPost = mongoose.model("CmsPost", cmsPostSchema);
module.exports = CmsPost;


