const mongoose = require("mongoose");
const { Schema } = mongoose;

const activitySchema = new Schema(
  {
    leadId: { type: String },
    activityType: { type: String },
    description: { type: String },

    // Email
    emailTo: { type: String },
    emailFrom: { type: String },
    emailSubject: { type: String },
    emailMessage: { type: String },
    emailFile: { type: String },
    emailNote: { type: String },

    // Note
    relatedTo: { type: String },
    noteMembers: { type: String },
    note: { type: String },

    // Meeting
    meetingTitle: { type: String },
    meetingNotes: { type: String },
    meetingType: { type: String },
    meetingDueDate: { type: String }, 
    timeFrom: { type: String },
    timeTo: { type: String },
    meetingLocation: { type: String },
    location: { type: String },
    landMark: { type: String },
    meetingStatus: { type: String },
    meetingLink:{type:String},

    // Task
    taskTitle: { type: String },
    taskDescription: { type: String },
    taskType: { type: String },
    taskDueDate: { type: String }, 
    time: { type: String },
    taskStatus: { type: String },

    userName: { type: String },
    userRole: { type: String },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
