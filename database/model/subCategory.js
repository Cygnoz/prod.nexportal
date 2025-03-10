const mongoose = require("mongoose");
const { Schema } = mongoose;

const subCategorySchema = new Schema({
    image: {type: String},
    subCategoryName: {type: String},
    order:{type:String},
    categoryName: { type: mongoose.Schema.Types.ObjectId, ref: "CmsCategory" },
    description:{type:String},
    articleCount: { type: Number, default: 0 }

}, { timestamps: true });

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategory;
