const mongoose = require("mongoose");
const { Schema } = mongoose;

const cmsCategorySchema = new Schema({
    categoryName: {type: String},
    description: {type: String},
    categoryType:{type:String}
}, { timestamps: true });

const CmsCategory = mongoose.model("CmsCategory", cmsCategorySchema);

module.exports = CmsCategory;
