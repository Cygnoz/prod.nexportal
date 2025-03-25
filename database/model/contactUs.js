const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactUsSchema = new Schema(
  {
    project:{type:String},
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phoneNo: { type: String },
    companyName : { type:String },
    companyAddress: { type: String},
    subject: { type: String },
    message:{type:String}
  },
  { timestamps: true }
);

const ContactUs = mongoose.model("ContactUs", contactUsSchema);
module.exports = ContactUs;
