const mongoose = require("mongoose");
const { Schema } = mongoose;

const cmsPostSchema = new Schema({
    title: { type: String },
    image: [{ type: String }], 
    postType: { type: String },
    link:{type:String},
    content : { type:String },  
    category: { type: mongoose.Schema.Types.ObjectId, ref: "cmsCategory" },
}, { timestamps: true });

const CmsPost = mongoose.model("CmsPost", cmsPostSchema);
module.exports = CmsPost;


