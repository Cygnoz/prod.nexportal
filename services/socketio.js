const Chat = require("../database/model/ticketChat");
const Leads = require("../database/model/leads");
const User = require("../database/model/user");
const Ticket = require("../database/model/ticket");
const filterByRole = require("./filterByRole");
 
const Socket = async (socket, io) => {
  const activeUsersInRooms = new Map();
  console.log(`User connected: ${socket.id}`);
 
 
  // Join Notification Room
  socket.on("joinNotificationRoom", async (userId) => {
    if (userId) {
      socket.join(userId);
      // console.log(`User ${userId} joined notification room`);
      try {
        let unreadCount = await Chat.countDocuments({
          receiverId: userId,
          isRead: false,
        });
        io.to(userId).emit("unreadCountUpdate", unreadCount);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    }
  });
 
  // Join Chat Room
  socket.on("joinRoom", async (ticketId, receiverId) => {
    socket.join(ticketId);
    console.log(`${socket.id} joined room: ${ticketId} with ${receiverId}`);
 
    // Get all sockets in the room
    const roomSockets = await io.in(ticketId).fetchSockets();
    const socketIds = roomSockets.map((socket) => socket.id);
 
    console.log(`Users in room ${ticketId}:`, socketIds);
 
    // Notify all users in the room that they are connected
    io.to(ticketId).emit("roomUsers", socketIds);
 
    try {
      // Mark all unread messages as read for this user
      await Chat.updateMany(
        { ticketId, receiverId, isRead: false },
        { $set: { isRead: true } }
      );
 
      // Get updated unread count for this user
      const unreadCount = await Chat.countDocuments({
        receiverId,
        isRead: false,
      });
 
      // Notify the user that their unread count has been updated
      io.to(receiverId).emit("unreadCountUpdate", unreadCount);
    } catch (error) {
      console.error("Error updating read status:", error);
    }
  });
 
  socket.on("leaveRoom", ({ ticketId, userId }) => {
    socket.leave(ticketId);
    if (activeUsersInRooms.has(ticketId)) {
      activeUsersInRooms.get(ticketId).delete(userId);
      if (activeUsersInRooms.get(ticketId).size === 0) {
        activeUsersInRooms.delete(ticketId);
      }
    }
    io.to(ticketId).emit("roomUsers", activeUsersInRooms);
    console.log(`User ${userId} left room ${ticketId}`);
  });
 
  // Send Message
  socket.on("sendMessage", async (data) => {
    try {
      const { ticketId, senderId, receiverId, message } = data;
      // console.log("d", data);
 
      // Get all sockets in the room
      const roomSockets = await io.in(ticketId).fetchSockets();
      const socketIds = roomSockets.map((socket) => socket.id);
 
      console.log(`Users in room ${ticketId}:`, socketIds); // Assuming you set userId when connecting
 
      // Check if receiver is in the room
      const isReceiverInRoom = socketIds?.length > 1;
      console.log("receverInroom", isReceiverInRoom);
      const newMessage = await Chat.create({
        ticketId,
        senderId,
        receiverId,
        message,
        isRead: isReceiverInRoom, // Set to true if receiver is in the room
      });
      await Ticket.findOneAndUpdate(
        { _id: ticketId },
        { updatedAt: newMessage.createdAt }
      );
 
      const processedMessage = newMessage.toObject();
 
      // Fetch sender details
      if (senderId) {
        const lead = await Leads.findOne({ email: senderId }).select(
          "_id fullName firstName image"
        );
        if (lead) {
          processedMessage.senderId = {
            _id: lead._id,
            name: lead.fullName || lead.firstName,
            role: "Customer",
            image: lead.image || null,
          };
        } else {
          const user = await User.findById(senderId).select(
            "_id userName role userImage"
          );
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
        const lead = await Leads.findOne({ email: receiverId }).select(
          "_id fullName firstName image"
        );
        if (lead) {
          processedMessage.receiverId = {
            _id: lead._id,
            name: lead.fullName || lead.firstName,
            role: "Customer",
            image: lead.image || null,
          };
        } else {
          const user = await User.findById(receiverId).select(
            "_id userName role userImage"
          );
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
 
      // Emit the new message to the room
      io.to(ticketId).emit("newMessage", processedMessage);
 
      // Calculate new unread count
      const unreadCount = await Chat.countDocuments({
        receiverId,
        isRead: false,
      });
 
      // Notify the receiver about the unread count update
      io.to(receiverId).emit("unreadCountUpdate", unreadCount);
 
      const allTickets = await getAllTickets(receiverId);
      io.to(receiverId).emit("getAllTickets", allTickets);
 
      // console.log(`Message sent in room ${ticketId} from ${senderId}:`, processedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
 
  const getAllTickets = async (userId) => {
    try {
      const query = await filterByRole(userId);
 
      // Fetch all tickets
      const tickets = await Ticket.find(query)
        .populate({
          path: "customerId",
          select: "firstName image",
        })
        .populate({
          path: "region",
          model: "Region",
          select: "regionName",
        })
        .populate({
          path: "supportAgentId",
          select: "user",
          populate: {
            path: "user",
            select: "userName userImage",
          },
        });
 
      if (!tickets || tickets.length === 0) {
        return "Tickets not found";
      }
 
      const totalTickets = tickets.length;
 
      // Calculate unresolved tickets (status != 'Resolved')
      const unresolvedTickets = tickets.filter(
        (ticket) => ticket.status !== "Resolved"
      ).length;
 
      // Calculate solved tickets (totalTickets - unresolvedTickets)
      const solvedTickets = totalTickets - unresolvedTickets;
 
      // Calculate unassigned tickets (supportAgentId === null)
      const unassignedTickets = tickets.filter(
        (ticket) => !ticket.supportAgentId
      ).length;
 
      const chatData = await Chat.aggregate([
        {
          $match: { isRead: false },
        },
        {
          $group: {
            _id: "$ticketId",
            unreadMessagesCount: { $sum: 1 },
          },
        },
      ]);
 
      // Create a map for quick lookup of unread counts
      const chatMap = new Map(
        chatData.map(chat => [chat._id.toString(), chat.unreadMessagesCount])
      );
 
      // Attach unreadMessagesCount to each ticket
      const ticketsWithUnreadCount = tickets.map(ticket => {
        const unreadMessagesCount = chatMap.get(ticket._id.toString()) || 0;
        return {
          ...ticket.toObject(),
          unreadMessagesCount,
        };
      });
 
      const allTickets = {
        tickets: ticketsWithUnreadCount,
        totalTickets,
        unresolvedTickets,
        solvedTickets,
        unassignedTickets,
      };
      return allTickets || [];
    } catch (error) {
      console.error("Error fetching all tickets:", error);
    }
  };
  socket.on('AddUnAssignedTickets',async()=>{
    const unassignedTickets = await Ticket.find({
        supportAgentId: { $exists: false },
      })
      .sort({ createdAt: -1 }) // Optional: Sorting by created date (newest first)
      .countDocuments();
      console.log("unass",unassignedTickets)
      io.emit('getAllUnAssignedTicket', unassignedTickets);
  })
 
  // Mark Messages as Read
  // socket.on("markAsRead", async (receiverId, ticketId) => {
  //     try {
  //         if (receiverId && ticketId) {
  //             await Chat.updateMany({ receiverId, ticketId, isRead: false }, { $set: { isRead: true } });
  //         }
  //     } catch (error) {
  //         console.error('Error marking messages as read:', error);
  //     }
  // });
 
  // Watch Ticket Collection Changes
  Ticket.watch().on("change", (change) => {
    console.log("Ticket Collection Updated:", change);
    io.emit("ticketCount", change);
  });
 
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
};
 
module.exports = Socket;