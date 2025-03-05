const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
    image: { type: String },
    title: { type: String },
    licensers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }],  // Array of ObjectIds
    body: { type: String },
    date: { type: String },
    time: { type: String },
    status : {type:String}
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
