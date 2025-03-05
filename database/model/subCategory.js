const mongoose = require("mongoose");
const { Schema } = mongoose;

const subCategorySchema = new Schema({
    image: {type: String},
    subCategoryName: {type: String},
    order:{type:String},
    category: { type: mongoose.Schema.Types.ObjectId, ref: "cmsCategory" },
    description:{type:String}

}, { timestamps: true });

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategory;
