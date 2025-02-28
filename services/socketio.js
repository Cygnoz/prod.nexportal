const Chat = require('../database/model/ticketChat');
const Leads = require('../database/model/leads');
const User = require('../database/model/user');
const Ticket = require('../database/model/ticket');
 
const Socket = async (socket, io) => {
    console.log(`User connected: ${socket.id}`);
 
    // Join room based on ticketId
    socket.on('joinRoom', async (ticketId, role) => {
        socket.join(ticketId);
        console.log(`${socket.id} joined room: ${ticketId} as ${role}`);
 
        try {
            if (role === 'Agent') {
                // Mark messages from the Customer as read by the Agent
                await Chat.updateMany(
                    { ticketId, agentRead: false },
                    { $set: { agentRead: true, unreadCount: 0 } }
                );
            } else if (role === 'Customer') {
                // Mark messages from the Agent as read by the Customer
                await Chat.updateMany(
                    { ticketId, clientRead: false },
                    { $set: { clientRead: true, unreadCount: 0 } }
                );
            }
 
            // Notify all clients in the room that messages have been marked as read
            io.to(ticketId).emit('messageReadNotification', { ticketId, role, status: 'read' });
 
        } catch (error) {
            console.error('Error updating read status on joinRoom:', error);
        }
    });
 
    // Listen for new messages
    socket.on('sendMessage', async (data) => {
        await sendMessage(io, data);
    });
 
    const sendMessage = async (io, messageData) => {
        try {
            const { ticketId, senderId, receiverId, message, role } = messageData;
 
            // Determine read status
            let readStatus = role === 'Customer' ? { clientRead: true } : { agentRead: true };
            const roomClients = io.sockets.adapter.rooms.get(ticketId);
            const isBothInRoom = roomClients && roomClients.size > 1;
            if (isBothInRoom) {
                readStatus = { clientRead: true, agentRead: true };
            }
 
            // Increment unreadCount for the receiver
            const unreadField = role === 'Customer' ? 'unreadCountAgent' : 'unreadCountClient';
            await Chat.updateMany(
                { ticketId, receiverId },
                { $inc: { unreadCount: 1 } }
            );
 
            // Save message
            const newMessage = await Chat.create({
                ticketId,
                senderId,
                receiverId,
                message,
                ...readStatus
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
 
            // Emit message and unread count update
            io.to(ticketId).emit('newMessage', processedMessage);
            io.to(ticketId).emit('unreadCountUpdate', { ticketId, unreadCount: 1 });
 
            console.log(`Message in room ${ticketId} from ${senderId}:`, processedMessage);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };
 
    socket.on('markAsRead', async (data) => {
        try {
            const { receiverId } = data;
    
            let updateFields = {};
    
            if (receiverId.includes('@')) { 
                updateFields = { clientRead: true, unreadCount: 0 };
            } else { 
                updateFields = { agentRead: true, unreadCount: 0 };
            }
    
            await Chat.updateMany({ receiverId }, { $set: updateFields });
    
            socket.emit('unreadCountUpdate', { unreadCount: 0 });
    
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    });
 

    socket.on('messageRead', async ({ ticketId, role }) => {
        try {
            if (role === 'Agent') {
                await Chat.updateMany(
                    { ticketId, senderId: { $ne: 'Agent' }, agentRead: false },
                    { $set: { agentRead: true } }
                );
                io.to(ticketId).emit('messageReadNotification', { ticketId, role, status: 'read' });
            } else if (role === 'Customer') {
                await Chat.updateMany(
                    { ticketId, senderId: { $ne: 'Customer' }, clientRead: false },
                    { $set: { clientRead: true } }
                );
                io.to(ticketId).emit('messageReadNotification', { ticketId, role, status: 'read' });
            }
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

 
    Ticket.watch().on("change", (change) => {
        console.log("Ticket Collection Updated:", change);
        socket.emit('ticketCount', change);
    });
 
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
};
 
module.exports = Socket;
