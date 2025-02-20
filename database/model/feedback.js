const mongoose = require('mongoose');
 
const feedbackSchema = new mongoose.Schema(
  {
    supportAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportAgent'},
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead'},
    feedback: { type: String },      
    starCount:{type:String},
  },
  { timestamps: true }
);
 
const Feedback = mongoose.model('Feedback', feedbackSchema);
 
module.exports = Feedback;