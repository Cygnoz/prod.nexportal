const mongoose = require('mongoose');
 
const messageSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket'},        
    senderId: { type: String },
    receiverId: { type: String },
    message: { type: String },
    clientRead: { type: String },
    agentRead: { type: String },     
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);
 
const Chat = mongoose.model('Chat', messageSchema);

module.exports = Chat;