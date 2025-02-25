const Chat = require('../database/model/ticketChat'); // Chat schema
const User = require('../database/model/user'); // User schema (for agents and clients)
const Leads = require('../database/model/leads'); // For customers
 
 
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

    // 🔥 Count unread messages for clientRead and agentRead under the given ticketId
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

    // ✅ Final response including unread counts
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

 
 
exports.getChatByCustomer = async (req, res) => {
  try {
    const { leadId } = req.params;
 
    // Validate if the provided leadId exists in the Leads collection
    // const lead = await Leads.findById(leadId);
    // if (!lead) {
    //   return res.status(404).json({ message: "Lead not found" });
    // }
 
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
        const messages = await Chat.find({ ticketId }).sort({ createdAt: -1 });
 
        // Process messages to populate sender and receiver details
        const processedMessages = await Promise.all(
          messages.map(async (message) => {
            const processedMessage = { ...message.toObject() };
 
            // Fetch sender details
            if (message.senderId) {
              const lead = await Leads.findOne({ email: message.senderId });
              if (lead) {
                processedMessage.senderId = {
                  name: lead.fullName,
                  role: 'Customer',
                };
              } else {
                const user = await User.findById(message.senderId); // Support agent
                if (user) {
                  processedMessage.senderId = {
                    name: user.userName,
                    role: user.role,
                  };
                }
              }
            }
 
            // Fetch receiver details
            if (message.receiverId) {
              const lead = await Leads.findOne({ email: message.receiverId });
              if (lead) {
                processedMessage.receiverId = {
                  name: lead.fullName ,
                  role: 'Customer',
                };
              } else {
                const user = await User.findById(message.receiverId); // Support agent
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
 
        return { ticketId, messages: processedMessages };
      })
    );
 
    // Respond with the grouped chat data
    res.status(200).json({
      message: "Chats retrieved successfully",
      data: chatData,
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
 