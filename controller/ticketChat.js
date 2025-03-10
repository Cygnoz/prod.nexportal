const Chat = require('../database/model/ticketChat'); // Chat schema
const User = require('../database/model/user'); // User schema (for agents and clients)
const Leads = require('../database/model/leads'); // For customers
const Tickets = require('../database/model/ticket') 
const SupportAgent = require("../database/model/supportAgent");


 
exports.sendMessage = async (req, res) => {
  try {
    const { ticketId, senderId, receiverId, message } = req.body;
 
    // Save the message in the database
    const newMessage = await Chat.create({
      ticketId,   // Associate with the ticketId
      senderId,
      receiverId,
      message,
      isRead: false
    });
 
    // Emit message through WebSocket (if socket.io is configured)
    if (global.io) {
      global.io.to(ticketId).emit('newMessage', newMessage); // Emit to the room using ticketId
    }
 
    res.status(200).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send message', error });
  }
};
 
 
 
 
exports.getChatHistory = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Count unread messages for clientRead and agentRead under the given ticketId
    const [clientUnreadCount, agentUnreadCount] = await Promise.all([
      Chat.countDocuments({ ticketId, clientRead: { $ne: 'true' } }),
      Chat.countDocuments({ ticketId, agentRead: { $ne: 'true' } })
    ]);

    // Fetch messages associated with the ticketId
    const messages = await Chat.find({ ticketId })
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    // Process messages to populate names, roles, and IDs dynamically
    const processedMessages = await Promise.all(
      messages.map(async (message) => {
        const processedMessage = { ...message.toObject() };

        // Fetch sender details
        if (message.senderId) {
          const lead = await Leads.findOne({ email: message.senderId }).select('_id fullName firstName');
          if (lead) {
            processedMessage.senderId = {
              _id: lead._id,
              name: lead.fullName || `${lead.firstName}`,
              role: 'Customer'
            };
          } else {
            const user = await User.findById(message.senderId).select('_id userName role userImage');
            if (user) {
              processedMessage.senderId = {
                _id: user._id,
                name: user.userName,
                role: user.role,
                image: user.userImage || null
              };
            }
          }
        }

        // Fetch receiver details
        if (message.receiverId) {
          const lead = await Leads.findOne({ email: message.receiverId }).select('_id fullName firstName image');
          if (lead) {
            processedMessage.receiverId = {
              _id: lead._id,
              name: lead.fullName || `${lead.firstName}`,
              role: 'Customer',
              image: lead.image || null
            };
          } else {
            const user = await User.findById(message.receiverId).select('_id userName role userImage');
            if (user) {
              processedMessage.receiverId = {
                _id: user._id,
                name: user.userName,
                role: user.role,
                image: user.userImage || null
              };
            }
          }
        }

        return processedMessage;
      })
    );

    //  Final response including unread counts
    res.status(200).json({
      message: 'Chat history retrieved successfully',
      data: processedMessages,
      unreadCounts: {
        clientUnreadCount,
        agentUnreadCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve chat history', error });
  }
};

 

exports.getUnusedTicketsCount = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from params

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    // Step 1: Check if the userId exists in the SupportAgent collection
    const supportAgent = await SupportAgent.findOne({ user: userId }).select("_id");

    if (!supportAgent) {
      return res.status(404).json({ error: "User is not a support agent" });
    }

    const supportAgentId = supportAgent._id; // Get the _id of the support agent

    // Step 2: Find all ticketIds assigned to the supportAgentId
    const tickets = await Tickets.find({ supportAgentId }).select("_id");
    const ticketIds = tickets.map(ticket => ticket._id);

    if (ticketIds.length === 0) {
      return res.json({ unusedTickets: 0 }); // No tickets assigned to this agent
    }

    // Step 3: Find all ticketIds where the agent has sent/received messages
    const usedTickets = await Chat.distinct("ticketId", {
      ticketId: { $in: ticketIds },
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    // Step 4: Compute the count of unused tickets
    const unusedTicketsCount = ticketIds.length - usedTickets.length;

    return res.json({ unusedTickets: unusedTicketsCount });
  } catch (error) {
    console.error("Error fetching unused ticket count:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



exports.getChatByCustomer = async (req, res) => {
  try {
    const { leadId } = req.params;
 
    // Find all ticketIds where the leadId appears as senderId or receiverId
    const ticketIds = await Chat.distinct('ticketId', {
      $or: [{ senderId: leadId }, { receiverId: leadId }],
    });
 
    if (ticketIds.length === 0) {
      return res.status(404).json({ message: "No chat found for this lead" });
    }
 
    // Fetch all chats grouped by ticketId
    const chatData = await Promise.all(
      ticketIds.map(async (ticketId) => {
        // Fetch ticket details
        const ticket = await Tickets.findById(ticketId)
          .populate({
            path: 'customerId',
            select: 'firstName image organizationName email phone',
          })
          .populate({
            path: 'region',
            model: 'Region',
            select: 'regionName',
          })
          .populate({
            path: 'supportAgentId',
            select: 'user',
            populate: {
              path: 'user',
              select: 'userName userImage',
            },
          });
        if (!ticket) return null; // Skip if ticket not found
 
        // Count unread messages and get the latest message time (lastMessageAt)
        const matchQuery = {
          ticketId: ticket._id,
        };
        if (leadId) {
          matchQuery.receiverId = leadId;
        }
 
        const chatAggregation = await Chat.aggregate([
          { $match: matchQuery },
          {
            $group: {
              _id: "$ticketId",
              unreadMessagesCount: {
                $sum: {
                  $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $eq: ["$receiverId", leadId] }] }, 1, 0],
                },
              }
            },
          },
        ]);
 
        const chatInfo = chatAggregation[0] || { unreadMessagesCount: 0 };
 
        // Attach unreadMessagesCount and lastMessageAt to ticket details
        const ticketDetails = {
          ...ticket.toObject(),
          unreadMessagesCount: chatInfo.unreadMessagesCount
        };
 
        // Fetch and process messages
        const messages = await Chat.find({ ticketId })
 
        const processedMessages = await Promise.all(
          messages.map(async (message) => {
            const processedMessage = { ...message.toObject() };
 
            // Sender details
            if (message.senderId) {
              const lead = await Leads.findOne({ email: message.senderId });
              if (lead) {
                processedMessage.senderId = {
                  name: lead.firstName,
                  role: 'Customer',
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
 
            // Receiver details
            if (message.receiverId) {
              const lead = await Leads.findOne({ email: message.receiverId });
              if (lead) {
                processedMessage.receiverId = {
                  name: lead.fullName,
                  role: 'Customer',
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
 
    // Filter out any null results (in case of missing tickets)
    const filteredChatData = chatData.filter((data) => data !== null);
 
    res.status(200).json({
      message: "Chats retrieved successfully",
      data: filteredChatData,
    });
  } catch (error) {
    console.error("Error fetching chats for lead:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
 
 
// // Get recent chats
// exports.getRecentChats = async (req, res) => {
//   try {
//     const { userId } = req.params;
 
//     // Find distinct chat IDs for the user
//     const recentChats = await Chat.aggregate([
//       { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
//       { $group: { _id: '$chatId', lastMessage: { $last: '$message' }, timestamp: { $last: '$timestamp' } } },
//       { $sort: { timestamp: -1 } }
//     ]);
 
//     res.status(200).json({
//       message: 'Recent chats retrieved successfully',
//       data: recentChats
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Failed to retrieve recent chats', error });
//   }
// };
 