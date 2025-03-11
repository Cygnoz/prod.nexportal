const mongoose = require("mongoose");
const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    image: { type: String },
    title: { type: String },
    articleImage : { type:String },
    content : { type:String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "CmsCategory" },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
