
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
                await Chat.updateMany(
                    { ticketId, agentRead: false },
                    { $set: { agentRead: true, unreadCountAgent: 0 } }
                );
            } else if (role === 'Customer') {
                await Chat.updateMany(
                    { ticketId, clientRead: false },
                    { $set: { clientRead: true, unreadCountClient: 0 } }
                );
            }

            io.to(ticketId).emit('messageReadNotification', { ticketId, role, status: 'read' });
            io.to(ticketId).emit('unreadCountUpdate', { ticketId, unreadCountAgent: 0, unreadCountClient: 0 });

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

            let readStatus = role === 'Customer' ? { clientRead: true } : { agentRead: true };
            const roomClients = io.sockets.adapter.rooms.get(ticketId);
            const isBothInRoom = roomClients && roomClients.size > 1;
            if (isBothInRoom) {
                readStatus = { clientRead: true, agentRead: true };
            }

            const unreadField = role === 'Customer' ? 'unreadCountAgent' : 'unreadCountClient';
            await Chat.updateMany(
                { ticketId, receiverId },
                { $inc: { [unreadField]: 1 } }
            );

            const newMessage = await Chat.create({
                ticketId,
                senderId,
                receiverId,
                message,
                ...readStatus
            });

            const processedMessage = newMessage ? newMessage.toObject() : {};

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

            io.to(ticketId).emit('newMessage', processedMessage);
            io.to(ticketId).emit('unreadCountUpdate', { ticketId, unreadCountAgent: processedMessage.unreadCountAgent, unreadCountClient: processedMessage.unreadCountClient });

            console.log(`Message in room ${ticketId} from ${senderId}:`, processedMessage);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    Ticket.watch().on("change", (change) => {
        console.log("Ticket Collection Updated:", change);
        socket.emit('ticketCount', change);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
};

module.exports = Socket;
