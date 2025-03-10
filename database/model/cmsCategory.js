const mongoose = require("mongoose");
const { Schema } = mongoose;

const cmsCategorySchema = new Schema({
    categoryName: { type: String },
    description: { type: String },
    categoryType: { type: String },
    image:{ type: String},
    order : {type: String },
    postCount: { type: Number, default: 0 } // Tracks the number of posts in this category
}, { timestamps: true });

const CmsCategory = mongoose.model("CmsCategory", cmsCategorySchema);

module.exports = CmsCategory;
