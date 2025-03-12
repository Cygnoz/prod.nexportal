const mongoose = require("mongoose");
const { Schema } = mongoose;

const termsAndConditionSchema = new Schema({
    project: { type: String },
    termTitle: {type: String},
    order: {type: String},
    termDescription:{type:String},
    type:{ type:String }
}, { timestamps: true });

const TermsAndCondition = mongoose.model("TermsAndCondition", termsAndConditionSchema);

module.exports = TermsAndCondition;
