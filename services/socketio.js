const Chat = require("../database/model/ticketChat");
const Leads = require("../database/model/leads");
const User = require("../database/model/user");
const Ticket = require("../database/model/ticket");
const SupportAgent=require("../database/model/supportAgent")
const filterByRole = require("./filterByRole");

const Socket = async (socket, io) => {
  const activeUsersInRooms = new Map();
  console.log(`User connected: ${socket.id}`);
  // await Chat.deleteMany({});
  // await Ticket.deleteMany({});

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
      const { ticketId, senderId, receiverId, message,role } = data;
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
      const allHistory=await getCustomerHistory(receiverId)
      io.to(receiverId).emit("getCustomerHistory",allHistory)
      if(role==="Agent"){
       const unUsedTicketsCount=await getUnusedTickets(receiverId)
       io.to(receiverId).emit('getUnusedTicketCount',unUsedTicketsCount);
      }
      // console.log(`Message sent in room ${ticketId} from ${senderId}:`, processedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  const getAllTickets = async (userId) => {
    try {
      let query = {};
  
      if (userId) {
        query = await filterByRole(userId);
      }
  
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
  
      const unresolvedTickets = tickets.filter(
        (ticket) => ticket.status !== "Resolved"
      ).length;
  
      const solvedTickets = totalTickets - unresolvedTickets;
  
      const unassignedTickets = tickets.filter(
        (ticket) => !ticket.supportAgentId
      ).length;
  
      const chatData = await Chat.aggregate([
        {
          $match: {
            receiverId: userId, // Filter messages for this user
          },
        },
        {
          $group: {
            _id: "$ticketId",
            unreadMessagesCount: {
              $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
            } // Get the latest message timestamp
          },
        },
      ]);
  
      const chatMap = new Map(
        chatData.map((chat) => [
          chat._id.toString(),
          {
            unreadMessagesCount: chat.unreadMessagesCount
          },
        ])
      );
  
      const ticketsWithUnreadCount = tickets.map((ticket) => {
        const chatInfo = chatMap.get(ticket._id.toString()) || {};
        return {
          ...ticket.toObject(),
          unreadMessagesCount: chatInfo.unreadMessagesCount || 0,
        };
      });
  
      return {
        tickets: ticketsWithUnreadCount,
        totalTickets,
        unresolvedTickets,
        solvedTickets,
        unassignedTickets,
      };
    } catch (error) {
      console.error("Error fetching all tickets:", error);
      return { error: "Something went wrong while fetching tickets." };
    }
  };
  
  
  const getCustomerHistory = async (leadId) => {
    try {
      const ticketIds = await Chat.distinct("ticketId", {
        $or: [{ senderId: leadId }, { receiverId: leadId }],
      });
  
      if (ticketIds.length === 0) {
        return "No chat found for this lead";
      }
  
      const chatTimestamps = await Chat.aggregate([
        { $match: { ticketId: { $in: ticketIds } } },
        {
          $group: {
            _id: "$ticketId",
            lastMessageAt: { $max: "$createdAt" },
          },
        },
      ]);
  
      const chatData = await Promise.all(
        ticketIds.map(async (ticketId) => {
          const ticket = await Ticket.findById(ticketId)
            .populate({
              path: "customerId",
              select: "firstName image organizationName email phone",
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
          if (!ticket) return null;
  
          const unreadCountData = await Chat.aggregate([
            {
              $match: {
                isRead: false,
                ticketId: ticket._id,
                receiverId: leadId,
              },
            },
            {
              $group: {
                _id: "$ticketId",
                unreadMessagesCount: { $sum: 1 },
              },
            },
          ]);
  
          const unreadMessagesCount =
            unreadCountData.length > 0
              ? unreadCountData[0].unreadMessagesCount
              : 0;
  
          const ticketDetails = {
            ...ticket.toObject(),
            unreadMessagesCount
          };
  
          const messages = await Chat.find({ ticketId })
  
          const processedMessages = await Promise.all(
            messages.map(async (message) => {
              const processedMessage = { ...message.toObject() };
  
              if (message.senderId) {
                const lead = await Leads.findOne({ email: message.senderId });
                if (lead) {
                  processedMessage.senderId = {
                    name: lead.firstName,
                    role: "Customer",
                  };
                } else {
                  const user = await User.findById(message.senderId);
                  if (user) {
                    processedMessage.senderId = {
                      name: user.userName,
                      role: user.role,
                    };
                  }
                }
              }
  
              if (message.receiverId) {
                const lead = await Leads.findOne({ email: message.receiverId });
                if (lead) {
                  processedMessage.receiverId = {
                    name: lead.fullName,
                    role: "Customer",
                  };
                } else {
                  const user = await User.findById(message.receiverId);
                  if (user) {
                    processedMessage.receiverId = {
                      name: user.userName,
                      role: user.role,
                    };
                  }
                }
              }
  
              return processedMessage;
            })
          );
  
          return { ticketDetails, messages: processedMessages };
        })
      );
  
      const filteredChatData = chatData.filter((data) => data !== null);
  
      return {
        message: "Chats retrieved successfully",
        data: filteredChatData,
      };
    } catch (error) {
      console.error("Error fetching chats for lead:", error);
      return { error: "Something went wrong while fetching customer history." };
    }
  };

  const getUnusedTickets=async(userId)=>{
    try {
   
      if (!userId) {
        return{ error: "UserId is required" }
      }
   
      // Step 1: Check if the userId exists in the SupportAgent collection
      const supportAgent = await SupportAgent.findOne({ user: userId }).select("_id");
   
      if (!supportAgent) {
        return { error: "User is not a support agent" }
      }
   
      const supportAgentId = supportAgent._id; // Get the _id of the support agent
   
      // Step 2: Find all ticketIds assigned to the supportAgentId
      const tickets = await Ticket.find({ supportAgentId }).select("_id");
      const ticketIds = tickets.map(ticket => ticket._id);
   
      if (ticketIds.length === 0) {
        return { unusedTickets: 0 } // No tickets assigned to this agent
      }
   
      // Step 3: Find all ticketIds where the agent has sent/received messages
      const usedTickets = await Chat.distinct("ticketId", {
        ticketId: { $in: ticketIds },
        $or: [{ senderId: userId }, { receiverId: userId }],
      });
   
      // Step 4: Compute the count of unused tickets
      const unusedTicketsCount = ticketIds.length - usedTickets.length;
   
      return { unusedTickets: unusedTicketsCount }
    } catch (error) {
      console.error("Error fetching unused ticket count:", error);
      return { error: "Internal server error" }
    }
  }
  
  


  socket.on('AddUnAssignedTickets',async()=>{
    const unassignedTicketsCount = await Ticket.find({
        supportAgentId: { $exists: false },
      })
      .sort({ createdAt: -1 }) // Optional: Sorting by created date (newest first)
      .countDocuments();
      const unAssignedTickets=await getAllTickets()
      io.emit("getAllTickets",unAssignedTickets)
      io.emit('getAllUnAssignedTicketCount', unassignedTicketsCount);
  })

  socket.on('EditAssignedTickets',async(receiverId)=>{
    const unassignedTicketsCount = await Ticket.find({
      supportAgentId: { $exists: false },
    })
    .sort({ createdAt: -1 }) // Optional: Sorting by created date (newest first)
    .countDocuments();
      const allTickets=await getAllTickets(receiverId)
      const unUsedTicketsCount=await getUnusedTickets(receiverId)
      io.emit('getAllUnAssignedTicketCount',unassignedTicketsCount);
      io.to(receiverId).emit("getAllTickets",allTickets)
      io.to(receiverId).emit('getUnusedTicketCount',unUsedTicketsCount);
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
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
};
 
module.exports = Socket;