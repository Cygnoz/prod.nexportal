const Chat = require('../database/model/ticketChat');
const Leads = require('../database/model/leads');
const User = require('../database/model/user');
const Ticket=require('../database/model/ticket')

 
const Socket = async (socket, io) => {
    console.log(`User connected: ${socket.id}`);
  
    // Join room based on ticketId
    socket.on('joinRoom', (ticketId) => {
      socket.join(ticketId);
      console.log(`${socket.id} joined room: ${ticketId}`);
  
      // Emit the chat history when a user joins a room
      socket.emit('requestChatHistory', ticketId);
    });
  
    // Listen for new messages
    socket.on('sendMessage', async (data) => {
      const { ticketId, senderId, receiverId, message } = data;
  
      try {
        // Save the message in the database with initial read status as false
        const newMessage = await Chat.create({
          ticketId,
          senderId,
          receiverId,
          message,
          clientRead: 'false',
          agentRead: 'false',
        });
  
        console.log('Saved message:', newMessage);
  
        const processedMessage = newMessage ? newMessage.toObject() : {};
  
        // Fetch sender details
        if (senderId) {
          const lead = await Leads.findOne({ email: senderId }).select('_id fullName firstName image');
          if (lead) {
            processedMessage.senderId = {
              _id: lead._id,
              name: lead.fullName || lead.firstName,
              role: 'Customer',
              image: lead.image || null,
            };
          } else {
            const user = await User.findById(senderId).select('_id userName role userImage');
            if (user) {
              processedMessage.senderId = {
                _id: user._id,
                name: user.userName,
                role: user.role,
                image: user.userImage || null,
              };
            }
          }
        }
  
        // Fetch receiver details
        if (receiverId) {
          const lead = await Leads.findOne({ email: receiverId }).select('_id fullName firstName image');
          if (lead) {
            processedMessage.receiverId = {
              _id: lead._id,
              name: lead.fullName || lead.firstName,
              role: 'Customer',
              image: lead.image || null,
            };
          } else {
            const user = await User.findById(receiverId).select('_id userName role userImage');
            if (user) {
              processedMessage.receiverId = {
                _id: user._id,
                name: user.userName,
                role: user.role,
                image: user.userImage || null,
              };
            }
          }
        }
  
        // Emit the processed message to the room identified by ticketId
        io.to(ticketId).emit('newMessage', processedMessage);
  
        // ------------------- Notification Logic -------------------
        io.to(ticketId).emit('notification', {
          ticketId,
          senderId,
          receiverId,
          message: 'You have a new message!',
          readStatus: {
            clientRead: 'false',
            agentRead: 'false',
          },
        });
  
        console.log(`Message in room ${ticketId} from ${senderId}:`, processedMessage);
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to save message', error });
      }
    });
  
    // Update read status when a user reads the message
    socket.on('messageRead', async ({ messageId, role }) => {
      try {
        const updateField = role === 'Customer' ? { clientRead: 'true' } : { agentRead: 'true' };
        await Chat.findByIdAndUpdate(messageId, updateField);
  
        console.log(`Message ${messageId} marked as read by ${role}`);
  
        io.emit('messageReadNotification', { messageId, role, status: 'read' });
      } catch (error) {
        console.error('Error updating read status:', error);
      }
    });
  
 
 
 
//             // Emit the processed message to the room identified by ticketId
//             io.to(ticketId).emit('newMessage', processedMessage);
 
//             console.log(`Message in room ${ticketId} from ${senderId}:`, processedMessage);
//         } catch (error) {
//             console.error('Error saving message:', error);
//             socket.emit('error', { message: 'Failed to save message', error });
//         }
//     });
 
 
 
    // Handle request for chat history
    // socket.on('requestChatHistory', async (ticketId) => {
    //     try {
    //         // Fetch messages associated with the ticketId from the database
    //         const messages = await Chat.find({ ticketId })
    //             .sort({ createdAt: -1 })
    //             .limit(50); // Optionally limit number of messages
 
    //         // Process messages to populate names and roles dynamically
    //         const processedMessages = await Promise.all(
    //             messages.map(async (message) => {
    //                 const processedMessage = { ...message.toObject() };
 
    //                 // Fetch sender details
    //                 if (message.senderId) {
    //                     const lead = await Leads.findOne({ email: message.senderId });
    //                     if (lead) {
    //                         processedMessage.senderId = {
    //                             name: lead.fullName || `${lead.firstName} ${lead.lastName}`,
    //                             role: 'Customer'
    //                         };
    //                     } else {
    //                         const user = await User.findById(message.senderId); // Otherwise, sender is a support agent
    //                         if (user) {
    //                             processedMessage.senderId = {
    //                                 name: user.userName,
    //                                 role: user.role
    //                             };
    //                         }
    //                     }
    //                 }
 
    //                 // Fetch receiver details
    //                 if (message.receiverId) {
    //                     const lead = await Leads.findOne({ email: message.receiverId });
    //                     if (lead) {
    //                         processedMessage.receiverId = {
    //                             name: lead.fullName || `${lead.firstName} ${lead.lastName}`,
    //                             role: 'Customer'
    //                         };
    //                     } else {
    //                         const user = await User.findById(message.receiverId); // Otherwise, receiver is a support agent
    //                         if (user) {
    //                             processedMessage.receiverId = {
    //                                 name: user.userName,
    //                                 role: user.role
    //                             };
    //                         }
    //                     }
    //                 }
 
    //                 return processedMessage;
    //             })
    //         );
 
    //         // Emit the chat history back to the client
    //         socket.emit('chatHistory', processedMessages);
    //     } catch (error) {
    //         console.error(error);
    //         socket.emit('error', { message: 'Failed to retrieve chat history', error });
    //     }
    // });
     // Fetch from your database
     Ticket.watch().on("change", (change) => {
        console.log("Ticket Collection Updated:", change);
        socket.emit('ticketCount', change);
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
};
 
module.exports = Socket;