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
                    { $set: { agentRead: true } }
                );
            } else if (role === 'Customer') {
                // Mark messages from the Agent as read by the Customer
                await Chat.updateMany(
                    { ticketId, clientRead: false },
                    { $set: { clientRead: true } }
                );
            }
 
            // Notify all clients in the room that messages have been marked as read
            io.to(ticketId).emit('messageReadNotification', { ticketId, role, status: 'read' });
 
        } catch (error) {
            console.error('Error updating read status on joinRoom:', error);
        }
 
   
    });


 // Fetch unread count for customers or support agents
 socket.on('getUnreadCount', async (data) => {
    try {
        let unreadCount = 0;

        if (data.email) {
            // Customer unread count (messages where clientRead is false)
            unreadCount = await Chat.countDocuments({
                receiverId: data.email,
                clientRead: 'false'
            });
        } else if (data._id) {
            // Support Agent unread count (messages where agentRead is false)
            unreadCount = await Chat.countDocuments({
                receiverId: data._id,
                agentRead: 'false'
            });
        }

        socket.emit('unreadCount', { count: unreadCount });

    } catch (error) {
        console.error('Error fetching unread count:', error);
    }
});

// Update unread count in real-time when a new message is sent
const updateUnreadCount = async (io) => {
    try {
        // Customer unread count
        const customerUnreadCount = await Chat.countDocuments({ clientRead: 'false' });

        // Agent unread count
        const agentUnreadCount = await Chat.countDocuments({ agentRead: 'false' });

        // Emit updated counts to all connected users
        io.emit('unreadCountUpdate', {
            customerUnreadCount,
            agentUnreadCount
        });

    } catch (error) {
        console.error('Error updating unread count:', error);
    }
};


 
    // Listen for new messages
    socket.on('sendMessage', async (data) => {
        const { ticketId, senderId, receiverId, message, role } = data;
 
        try {
            // Reset read status when customer sends a new message
            let readStatus = role === 'Customer'
                ? { clientRead: true }
                : { agentRead: true };
                const roomClients = io.sockets.adapter.rooms.get(ticketId);
                const isBothInRoom = roomClients && roomClients.size > 1;
                if (isBothInRoom) {
                    readStatus = { clientRead: true, agentRead: true };
                }
            // Save the message in the database
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
 
            // Emit the processed message to the room identified by ticketId
            io.to(ticketId).emit('newMessage', processedMessage);
 
            // Notification Logic
            io.to(ticketId).emit('notification', {
                ticketId,
                senderId,
                receiverId,
                message: 'You have a new message!',
                readStatus: readStatus,
            });
 
            console.log(`Message in room ${ticketId} from ${senderId}:`, processedMessage);

            updateUnreadCount(io);


        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Failed to save message', error });
        }
    });
 
    socket.on('messageRead', async ({ ticketId, role }) => {
        try {
            if (role === 'Agent') {
                // Update only the messages sent by the customer (unread by the agent)
                await Chat.updateMany(
                    { ticketId, senderId: { $ne: 'Agent' }, agentRead: false },
                    { $set: { agentRead: true } }
                );
 
                console.log(`Messages for ticket ${ticketId} marked as read by Agent`);
 
                io.to(ticketId).emit('messageReadNotification', { ticketId, role, status: 'read' });
            } else if (role === 'Customer') {
                // Update only the messages sent by the agent (unread by the customer)
                await Chat.updateMany(
                    { ticketId, senderId: { $ne: 'Customer' }, clientRead: false },
                    { $set: { clientRead: true } }
                );
 
                console.log(`Messages for ticket ${ticketId} marked as read by Customer`);
 
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