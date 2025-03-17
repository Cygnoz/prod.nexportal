// Importing models
const Ticket = require("../database/model/ticket");
const Leads = require("../database/model/leads");
const Region = require("../database/model/region");
const Supervisor = require("../database/model/supervisor");
const SupportAgent = require("../database/model/supportAgent");
const User = require("../database/model/user");
const { Types } = require("mongoose");
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const filterByRole = require("../services/filterByRole");
const Feedback = require("../database/model/feedback");
const Chat = require('../database/model/ticketChat') 
const axios = require("axios");
 
// Function to clean data
function cleanTicketData(data) {
  const cleanData = (value) => (value === null || value === undefined || value === 0 ? undefined : value);
  return Object.keys(data).reduce((acc, key) => {
    acc[key] = cleanData(data[key]);
    return acc;
  }, {});
}
 
// Function to generate the current date and time in a specified time zone
function generateOpeningDate(timeZone = "Asia/Kolkata", dateFormat = "YYYY-MM-DD", dateSplit = "-", timeFormat = "HH:mm:ss", timeSplit = ":") {
  const localDate = moment.tz(new Date(), timeZone);
  let formattedDate = localDate.format(dateFormat);
  if (dateSplit) {
    formattedDate = formattedDate.replace(/[-/]/g, dateSplit);
  }
  const formattedTime = localDate.format(timeFormat).replace(/:/g, timeSplit);
  const timeZoneName = localDate.format("z");
  const dateTime = `${formattedDate} ${formattedTime} (${timeZoneName})`;
 
  return {
    date: formattedDate,
    time: `${formattedTime} (${timeZoneName})`,
    dateTime,
  };
}
 




exports.addFeedback = async (req, res) => {
    try {
        const { supportAgentId, customerId, feedback, starCount, ticketId } = req.body;

        // Validate ticketId
        if (!mongoose.Types.ObjectId.isValid(ticketId)) {
            return res.status(400).json({ message: "Invalid ticket ID" });
        }

        // Find and update ticket status to 'Close'
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            { status: "Closed" },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Create new feedback entry
        const newFeedback = new Feedback({
            supportAgentId,
            customerId,
            feedback,
            starCount,
            ticketId
        });

        await newFeedback.save();

        res.status(201).json({
            message: "Feedback added successfully and ticket closed",
            feedback: newFeedback,
            updatedTicket
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

 
 
 
// Function to validate customer and support agent existence
const dataExist = async (customerId, supportAgentId) => {
  const [customerExists, supportAgentExists] = await Promise.all([
    Leads.find({ _id: customerId }, { _id: 1, firstName: 1 , image:1 }),
    SupportAgent.findOne({ _id: new Types.ObjectId(supportAgentId) }, { _id: 1, user: 1, region:1 }),
  ]);
 
  let supportAgentName = null;
  if (supportAgentExists && supportAgentExists.user) {
    const supportAgentUser = await User.findOne({ _id: supportAgentExists.user }, { userName: 1 });
    if (supportAgentUser) {
      supportAgentName = supportAgentUser.userName;
    }
  }
 
  return {
    customerExists,
    supportAgentExists: supportAgentExists || null,
    supportAgentName,
  };
};

exports.getFeedbackByAgent = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch all feedback documents that match the given supportAgentId and populate Lead and Ticket collections
    const feedbacks = await Feedback.find({ supportAgentId: id })
      .populate("customerId", "firstName image")
      .populate("ticketId", "ticketId subject");

    // Return the matched feedback documents as a response
    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error.message);
    res.status(500).json({ message: error.message });
  }
};
 
 
 

 
exports.addTicket = async (req, res, next) => {
  try {
    const { id: userId, userName } = req.user;
    const cleanedData = cleanTicketData(req.body);
    const { customerId, priority, supportAgentId, ticketId } = cleanedData;
 
    // Validate required fields
    if (!customerId || !priority || !supportAgentId) {
      return res.status(400).json({ message: "Customer, priority, and support agent are required" });
    }
    
    // Check if customer and support agent exist
    const { customerExists, supportAgentExists } = await dataExist(customerId, supportAgentId);
    cleanedData.region = supportAgentExists.region;
 
    if (!customerExists) {
      return res.status(404).json({ message: "Customer not found" });
    }
    if (!supportAgentExists) {
      return res.status(404).json({ message: "Support Agent not found" });
    }
 
    // Fetch support agent details, including the region
    const supportAgent = await mongoose.model("SupportAgent").findById(supportAgentId).populate({
      path: "region",
      select: "_id name",
    });
 
    if (!supportAgent || !supportAgent.region) {
      return res.status(404).json({ message: "Region not found for the support agent" });
    }
 
    // Fetch supervisor based on the same region
    const supervisor = await mongoose.model("Supervisor").findOne({ region: supportAgent.region._id });
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found in the same region" });
    }
 
    cleanedData.supervisor = supervisor._id;
 
    // Create the ticket using the createTicket function
    const savedTicket = await createTicket(cleanedData, customerId, supportAgentId, userId, userName);
 
    res.status(201).json({
      message: "Ticket added successfully",
      savedTicket: { ...savedTicket.toObject() },
    });
 
    ActivityLog(req, "successfully", savedTicket._id);
    next();
  } catch (error) {
    console.error("Error adding ticket:", error);
    res.status(500).json({ message: "Internal server error" });
    ActivityLog(req, "Failed");
    next();
  }
};
 


exports.unassignedTickets = async (req, res, next) => {
  try {
    const { requester, subject, description, uploads = [], choice = [], text = [] } = req.body;

    // Validate required fields
    if (!requester || !subject || !description) {
      return res.status(400).json({ message: "Requester, subject, and description are required" });
    }

    // Find customer (Lead) by email
    const lead = await Leads.findOne({ email: requester });
    if (!lead) {
      return res.status(404).json({ message: "Requester not found in Leads" });
    }

    const { _id: customerId, regionId } = lead;

    // Find supervisor by region
    const supervisor = await Supervisor.findOne({ region: regionId });
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found for the requester's region" });
    }

    // Generate next ticket ID
    let nextId = 1;
    const lastTicket = await Ticket.findOne().sort({ ticketId: -1 });
    if (lastTicket && lastTicket.ticketId) {
      const splitId = lastTicket.ticketId.split("-");
      if (splitId.length > 1) {
        nextId = parseInt(splitId[1]) + 1;
      }
    }

    // Convert module and text from array of objects to array of key-value pairs
    const formattedModule = choice.map(({ label, value }) => ({ [label]: value }));
    const formattedText = text.map(({ label, value }) => ({ [label]: value }));

    // Create new ticket
    const newTicket = new Ticket({
      ticketId: `TK-${nextId}`,
      customerId,
      region: regionId,
      supervisor: supervisor._id,
      subject,
      description,
      status: "Open",
      openingDate: new Date().toISOString(),
      uploads,  // Now directly assigned from request body
      choice: formattedModule,  // Converted to key-value objects
      text: formattedText      // Converted to key-value objects
    });

    const savedTicket = await newTicket.save();

    res.status(201).json({
      message: "Your ticket has been created successfully!",
      ticketId: savedTicket._id
    });

    next();
  } catch (error) {
    console.error("Error creating unassigned ticket:", error);
    res.status(500).json({ message: "Internal server error" });
    next();
  }
};




// exports.getTicket = async (req, res) => {
//   try {
//     const { ticketId } = req.params;
//     const ticket = await Ticket.findById(ticketId)
//       .populate({
//         path: 'customerId',
//         select: 'firstName image organizationName email phone',
//       })
//       .populate({
//         path: 'region',
//         model: 'Region',
//         select: 'regionName',
//       })
//       .populate({
//         path: 'supportAgentId',
//         select: 'user',
//         populate: {
//           path: 'user',
//           select: 'userName userImage',
//         },
//       });
 
//     if (!ticket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }
 
//     res.status(200).json(ticket);
//   } catch (error) {
//     console.error('Error fetching ticket:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


 
exports.getTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userEmail = req.query.email; // Extract email from query
    // Fetch the ticket
    const ticket = await Ticket.findById(ticketId)
      .populate({
        path: 'customerId',
        select: 'firstName image organizationName email phone plan project',
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
 
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
 
    // Get unread message count where receiverId matches the email from query
    const matchQuery = {
      isRead: false,
      ticketId: ticket._id,
    };
   
    if (userEmail) {
      matchQuery.receiverId = userEmail;
    }
   
    const chatData = await Chat.aggregate([
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: "$ticketId",
          unreadMessagesCount: { $sum: 1 },
        },
      },
    ]);
   
 
    // Extract unread count (default to 0 if no unread messages)
    const unreadMessagesCount = chatData.length > 0 ? chatData[0].unreadMessagesCount : 0;
 
    // Attach unreadMessagesCount to the ticket response
    const ticketWithUnreadCount = {
      ...ticket.toObject(),
      unreadMessagesCount,
    };
 
 
    res.status(200).json(ticketWithUnreadCount);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getAllTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = await filterByRole(userId);

    const { project, date } = req.query;

    // Fetch all tickets first (before applying project filter) to retain all project counts
    const allTickets = await Ticket.find(query).populate({
      path: "customerId",
      select: "firstName image plan project",
    });

    // Step 1: Initialize ticketCountByProject with 0 for all projects
    const ticketCountByProject = {};
    allTickets.forEach((ticket) => {
      if (ticket.customerId?.project) {
        ticketCountByProject[ticket.customerId.project] =
          (ticketCountByProject[ticket.customerId.project] || 0) + 1;
      }
    });

    // Apply project filter to get relevant customerIds
    let customerIds = [];
    if (project) {
      const leads = await Leads.find({ project }).select("_id");
      customerIds = leads.map((lead) => lead._id);
      query.customerId = { $in: customerIds };
    }

    // Apply date filter if provided
    if (date) {
      const formattedDate = moment
        .tz(date, "Asia/Kolkata")
        .format("YYYY-MM-DD");
      query.openingDate = new RegExp(`^${formattedDate}`);
    }

    // Fetch filtered tickets after applying project/date filter
    const tickets = await Ticket.find(query)
      .populate({
        path: "customerId",
        select: "firstName image plan project",
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
      return res.status(404).json({ message: "Tickets not found" });
    }

    const totalTickets = tickets.length;
    const unresolvedTickets = tickets.filter(
      (ticket) => ticket.status !== "Resolved" && ticket.status !== "Closed"
    ).length;
    const closedTickets = tickets.filter(
      (ticket) => ticket.status === "Closed"
    ).length;
    const solvedTickets = totalTickets - unresolvedTickets;
    const unassignedTickets = tickets.filter(
      (ticket) => !ticket.supportAgentId
    ).length;

    // Initialize status counts
    const statusCounts = {
      Open: 0,
      Closed: 0,
      Resolved: 0,
      "In progress": 0,
    };

    // Count tickets by status
    tickets.forEach((ticket) => {
      if (statusCounts.hasOwnProperty(ticket.status)) {
        statusCounts[ticket.status]++;
      }
    });

    // Step 2: Maintain project counts and update only unresolved ticket counts
    Object.keys(ticketCountByProject).forEach((proj) => {
      ticketCountByProject[proj] = allTickets.filter(
        (ticket) =>
          ticket.customerId?.project === proj &&
          ticket.status !== "Resolved" &&
          ticket.status !== "Closed"
      ).length;
    });

    // Get unread counts for tickets where receiverId = userId
    const chatData = await Chat.aggregate([
      {
        $match: {
          isRead: false,
          receiverId: userId,
        },
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
      chatData.map((chat) => [chat._id.toString(), chat.unreadMessagesCount])
    );

    // Attach unreadMessagesCount to each ticket
    const ticketsWithUnreadCount = tickets.map((ticket) => ({
      ...ticket.toObject(),
      unreadMessagesCount: chatMap.get(ticket._id.toString()) || 0,
    }));

    res.status(200).json({
      tickets: ticketsWithUnreadCount,
      totalTickets,
      unresolvedTickets,
      solvedTickets,
      unassignedTickets,
      closedTickets,
      ticketCountByProject, // ✅ Now includes all projects even when filtering
      statusCounts,
    });
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


 



exports.getAllUnassignedTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = await filterByRole(userId);

    // Add condition to filter unassigned tickets
    query.supportAgentId = null;

    const tickets = await Ticket.find(query)
      .populate({
        path: 'customerId',
        select: 'firstName imag ',
      })
      .populate({
        path: 'region',
        model: 'Region',
        select: 'regionName',
      })
      .populate({
        path: 'supervisor',
        select: 'name email',
      });

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: 'No unassigned tickets found' });
    }

    const totalTickets = tickets.length;
    res.status(200).json({ tickets, totalTickets });
  } catch (error) {
    console.error("Error fetching unassigned tickets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

 
 
 
 
 
exports.getCustomers = async (req, res) => {
  try {
    // Fetch customers with customerStatus "Trial" or "Licenser"
    const customers = await Leads.find({
      customerStatus: { $in: ["Trial", "Licenser"] },
    });
 
    if (!customers || customers.length === 0) {
      return res
        .status(404)
        .json({ message: "No customers found with Trial or Licenser status" });
    }
 
    // Respond with the list of customers
    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
 
exports.updateTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const updateFields = { ...req.body };

    // Check if the status is being updated to 'Resolved'
    if (updateFields.status === 'Resolved') {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const openingDate = new Date(ticket.openingDate); // Convert to Date object
      const currentDate = new Date();
      const resolutionTime = Math.abs(currentDate - openingDate); // Time difference in milliseconds

      // Convert milliseconds to hours and minutes
      const hours = Math.floor(resolutionTime / (1000 * 60 * 60));
      const minutes = Math.floor((resolutionTime % (1000 * 60 * 60)) / (1000 * 60));

      updateFields.resolutionTime = `${hours} hours ${minutes} minutes`;
    }

    // Update the ticket in the database
    const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updateFields, { new: true })
      .populate({
        path: "supportAgentId",
        populate: {
          path: "user",
          select: "_id userName email", // Selecting necessary fields from User
        },
      });

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Extract the user _id from the populated support agent
    const supportAgent = updatedTicket.supportAgentId;
    const userId = supportAgent && supportAgent.user ? supportAgent.user._id : null;

    ActivityLog(req, "Successfully updated ticket", updatedTicket._id);
    next();

    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket: updatedTicket,
      userId, // Include the User._id in the response
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    ActivityLog(req, "Failed to update ticket");
    next();
    return res.status(500).json({ message: "Internal server error" });
  }
};


 
 
 
 
exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);
 
    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
 
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
 
 
 
 
const ActivityLog = (req, status, operationId = null) => {
  const { id, userName } = req.user;
  const log = { id, userName, status };
 
  if (operationId) {
    log.operationId = operationId;
  }
 
  req.user = log;
};
 
 
 
 
async function createTicket(cleanedData, customerId, supportAgentId, userId, userName) {
  const { ...rest } = cleanedData;
 
  // Generate next ticket ID
  let nextId = 1;
  const lastTicket = await Ticket.findOne().sort({ ticketId: -1 });
 
  if (lastTicket && lastTicket.ticketId) {
    const splitId = lastTicket.ticketId.split("-");
    if (splitId.length > 1) {
      nextId = parseInt(splitId[1]) + 1;
    }
  }
 
  const newTicket = new Ticket({
    ...rest,
    ticketId: `TK-${nextId}`,
    openedBy: userId,
    openedByName: userName,
    openingDate: generateOpeningDate().dateTime,
    status:"Open",
    customerId,
    supportAgentId,
  });
 
  return newTicket.save();
}





exports.initiateCall = async (req, res) => {
  try {
    // Extract destination number and ticketId from request body
    const { destination_number, ticketId } = req.body;

    if (!destination_number || !ticketId) {
      return res.status(400).json({ message: "Destination number and Ticket ID are required." });
    }

    // Generate API token (Assuming token is needed)
    const token = process.env.SMARTFLO_API_TOKEN;
    
    if (!token) {
      return res.status(500).json({ message: "API token is missing in environment variables." });
    }

    // Prepare request body
    const requestBody = {
      agent_number: process.env.AGENT_NUMBER,
      destination_number,
      caller_id: process.env.CALLER_ID,
      async: 1,
      call_timeout: 120,
      get_call_id: 1,
    };

    // Call API with token authentication
    const response = await axios.post(
      "https://api-smartflo.tatateleservices.com/v1/click_to_call",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    // Check API response
    if (response.status !== 200) {
      return res.status(response.status).json({ message: response.statusText });
    }

    const call_id = response.data.call_id;

    // Update ticket with new call_id in callIds array
    await Ticket.findByIdAndUpdate(
      ticketId,
      { $push: { callIds: call_id } },
      { new: true }
    );

    res.status(200).json({ message: "Call initiated successfully", call_id });
  } catch (error) {
    console.error("Error initiating call:", error.message);
    if (error.response) {
      return res.status(error.response.status).json({ message: error.response.data || "Error from external API." });
    }
    res.status(500).json({ message: "Internal server error." });
  }
};

