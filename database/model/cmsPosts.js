const mongoose = require("mongoose");
const { Schema } = mongoose;

const CmsPostSchema = new Schema(
  {
    project: { type: String },
    title: { type: String, required: true },
    image: { type: [String] }, // Now supports multiple images
    link: { type: String },
    postType: { type: String, required: true },
    content: { type: String },
    
    //Event
    meetingType:{type:String},
    location:{ type:String },
    meetingDate :{ type:String },
    startTime :{ type:String },
    endTime :{ type:String },
    venueName: {type:String},
    address:{ type:String },
    meetingLink:{ type:String },

    category: { type: Schema.Types.ObjectId, ref: "CmsCategory", required: true },
    createdBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      userName: { type: String, required: true },
      userImage: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CmsPost", CmsPostSchema);
