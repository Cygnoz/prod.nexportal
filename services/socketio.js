const Chat = require('../database/model/ticketChat');
const Leads = require('../database/model/leads');
const User = require('../database/model/user');
const Ticket = require('../database/model/ticket');

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
        const { ticketId, senderId, receiverId, message, role } = data;

        try {
            // Reset read status when customer sends a new message
            const readStatus = role === 'Customer'
                ? { clientRead: 'false', agentRead: 'false' }
                : { clientRead: 'true', agentRead: 'false' };

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

            // Emit unread message count for customer and agent
            await emitUnreadCounts(io, senderId, receiverId);

            // Notification Logic
            io.to(ticketId).emit('notification', {
                ticketId,
                senderId,
                receiverId,
                message: 'You have a new message!',
                readStatus: readStatus,
            });

            console.log(`Message in room ${ticketId} from ${senderId}:`, processedMessage);
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Failed to save message', error });
        }
    });

    // Event to mark messages as read
    socket.on('messageRead', async ({ ticketId, role }) => {
        try {
            if (role === 'Agent') {
                // Update messages sent by the customer that are unread by the agent
                await Chat.updateMany(
                    { ticketId, agentRead: 'false' },
                    { $set: { agentRead: 'true' } }
                );

                console.log(`Messages for ticket ${ticketId} marked as read by Agent`);

                // Notify the frontend that messages have been read
                io.to(ticketId).emit('messageReadNotification', { ticketId, role, status: 'read' });

            } else if (role === 'Customer') {
                // Update messages sent by the agent that are unread by the customer
                await Chat.updateMany(
                    { ticketId, clientRead: 'false' },
                    { $set: { clientRead: 'true' } }
                );

                console.log(`Messages for ticket ${ticketId} marked as read by Customer`);

                // Notify the frontend
                io.to(ticketId).emit('messageReadNotification', { ticketId, role, status: 'read' });
            }
        } catch (error) {
            console.error('Error updating read status:', error);
        }
    });

   
    const emitUnreadCounts = async (io, senderId, receiverId) => {
        try {
            // Get sender's role (Customer or Agent)
            const sender = await User.findById(senderId) || await Leads.findOne({ email: senderId });
            const senderRole = sender?.role === 'Agent' ? 'Agent' : 'Customer'; // Default to 'Customer' if not found
    
            const receiver = await User.findById(receiverId) || await Leads.findOne({ email: receiverId });
            const receiverRole = receiver?.role === 'Agent' ? 'Agent' : 'Customer';
    
            // Determine who is the customer and who is the agent
            const customerId = senderRole === 'Customer' ? senderId : receiverId;
            const agentId = senderRole === 'Agent' ? senderId : receiverId;
    
            // Fetch unread counts
            const customerUnreadCount = await Chat.countDocuments({
                receiverId: customerId,
                clientRead: 'false'
            });
    
            const agentUnreadCount = await Chat.countDocuments({
                receiverId: agentId,
                agentRead: 'false'
            });
    
            // Emit unread counts to the correct users
            io.to(customerId).emit('unreadMessageCount', {
                role: 'Customer',
                unreadCount: customerUnreadCount
            });
    
            io.to(agentId).emit('unreadMessageCount', {
                role: 'Agent',
                unreadCount: agentUnreadCount
            });
    
            console.log(`Unread messages: Customer (${customerId}): ${customerUnreadCount}, Agent (${agentId}): ${agentUnreadCount}`);
        } catch (error) {
            console.error('Error fetching unread message counts:', error);
        }
    };

    
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

    // Watch the Ticket collection for updates
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
