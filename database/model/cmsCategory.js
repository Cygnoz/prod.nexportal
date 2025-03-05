const mongoose = require("mongoose");
const { Schema } = mongoose;

const cmsCategorySchema = new Schema({
    categoryName: {type: String},
    description: {type: String},
    categoryType:{type:String}
}, { timestamps: true });

const CmsCategory = mongoose.model("Category", cmsCategorySchema);

module.exports = CmsCategory;
