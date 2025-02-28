const Chat = require('../database/model/ticketChat');
const Leads = require('../database/model/leads');
const User = require('../database/model/user');
const Ticket = require('../database/model/ticket');
 
const Socket = async (socket, io) => {
    console.log(`User connected: ${socket.id}`);
 
    // Join room based on ticketId
    socket.on('joinRoom', async (ticketId, role, userId) => {
        socket.join(ticketId);
        console.log(`${socket.id} joined room: ${ticketId} as ${role}`);
    
        try {
            let updateFields = {};
            let unreadCountUpdate = { ticketId };
    
            if (role === 'Agent') {
                updateFields = { agentRead: true };
                await Chat.updateMany({ ticketId, receiverId: userId, agentRead: false }, { $set: updateFields });
                unreadCountUpdate.unreadCountAgent = await Chat.countDocuments({ ticketId, agentRead: false });
            } else if (role === 'Customer') {
                updateFields = { clientRead: true };
                await Chat.updateMany({ ticketId, receiverId: userId, clientRead: false }, { $set: updateFields });
                unreadCountUpdate.unreadCountClient = await Chat.countDocuments({ ticketId, clientRead: false });
            }
    
            io.to(ticketId).emit('messageReadNotification', { ticketId, role, status: 'read' });
            io.to(ticketId).emit('unreadCountUpdate', unreadCountUpdate);
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
    
            let readStatus = {};
            let unreadField = role === 'Customer' ? 'unreadCountAgent' : 'unreadCountClient';
    
            const roomClients = io.sockets.adapter.rooms.get(ticketId);
            const isReceiverInRoom = roomClients && [...roomClients].some(id => io.sockets.sockets.get(id).userId === receiverId);
    
            if (role === 'Customer' && isReceiverInRoom) {
                readStatus.agentRead = true;
            } else if (role === 'Agent' && isReceiverInRoom) {
                readStatus.clientRead = true;
            } else {
                await Chat.updateMany({ ticketId, receiverId }, { $inc: { [unreadField]: 1 } });
            }
    
            const newMessage = await Chat.create({
                ticketId,
                senderId,
                receiverId,
                message,
                ...readStatus
            });
    
            const processedMessage = newMessage.toObject();
    
            io.to(ticketId).emit('newMessage', processedMessage);
            io.to(ticketId).emit('unreadCountUpdate', {
                ticketId,
                [unreadField]: await Chat.countDocuments({ ticketId, [unreadField === 'unreadCountAgent' ? 'agentRead' : 'clientRead']: false })
            });
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