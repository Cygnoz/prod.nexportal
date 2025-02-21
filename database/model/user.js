// v1.0

const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    employeeId: { type: String },
    userImage: { type: String },
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNo: { type: String, required: true },
    role: { type: String, required: true },
  },
  { timestamps: true } // This enables the createdAt and updatedAt fields
);



const User = mongoose.model("User", userSchema);

module.exports = User;