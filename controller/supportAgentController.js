const User = require("../database/model/user");
const Region = require("../database/model/region");
const Commission = require("../database/model/commission");
const SupportAgent = require("../database/model/supportAgent");
const Supervisor = require("../database/model/supervisor");
const Ticket = require("../database/model/ticket");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { ObjectId } = require("mongoose").Types;
const nodemailer = require("nodemailer");
const Praise = require('../database/model/praise')
const ActivityLog = require('../database/model/activityLog')
const moment = require("moment");
const mongoose = require("mongoose");
const key = Buffer.from(process.env.ENCRYPTION_KEY, "utf8");
const iv = Buffer.from(process.env.ENCRYPTION_IV, "utf8");

//Encrpytion
function encrypt(text) {
  try {
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex"); // Get authentication tag

    return `${iv.toString("hex")}:${encrypted}:${authTag}`; // Return IV, encrypted text, and tag
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
}

//Decrpytion
function decrypt(encryptedText) {
  try {
    // Split the encrypted text to get the IV, encrypted data, and authentication tag
    const [ivHex, encryptedData, authTagHex] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    // Create the decipher with the algorithm, key, and IV
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag); // Set the authentication tag

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
}

// A function to encrypt sensitive fields if they exist
const encryptSensitiveFields = (data) => {
  const encryptIfExists = (field) => (field ? encrypt(field) : field);

  data.adhaarNo = encryptIfExists(data.adhaarNo);
  data.panNo = encryptIfExists(data.panNo);
  if (data.bankDetails) {
    data.bankDetails.bankAccountNo = encryptIfExists(
      data.bankDetails.bankAccountNo
    );
  }

  return data;
};

// Validation utility function
const validateRequiredFields = (requiredFields, data) => {
  const missingFields = requiredFields.filter((field) => !data[field]);
  return missingFields.length === 0
    ? null
    : `Missing required fields: ${missingFields.join(", ")}`;
};

// Duplicate check utility function

const checkDuplicateUser = async (userName, email, phoneNo, excludeId) => {
  const existingUser = await User.findOne({
    $and: [
      { _id: { $ne: excludeId } }, // Exclude the current document
      {
        $or: [{ userName }, { email }, { phoneNo }],
      },
    ],
  });

  if (!existingUser) return null;

  const duplicateMessages = [];
  if (existingUser.userName === userName)
    duplicateMessages.push("Full name already exists");
  if (existingUser.email === email)
    duplicateMessages.push("Login email already exists");
  if (existingUser.phoneNo === phoneNo)
    duplicateMessages.push("Phone number already exists");

  return duplicateMessages.join(". ");
};

// Logging utility function
const logOperation = (req, status, operationId = null) => {
  const { id, userName } = req.user;
  const log = { id, userName, status };

  if (operationId) {
    log.operationId = operationId;
  }

  req.user = log;
};

function cleanData(data) {
  const cleanData = (value) =>
    value === null || value === undefined || value === "" || value === 0
      ? undefined
      : value;
  return Object.keys(data).reduce((acc, key) => {
    acc[key] = cleanData(data[key]);
    return acc;
  }, {});
}

async function createUser(data) {
  const { password, ...rest } = data; // Extract password and the rest of the data
  const hashedPassword = await bcrypt.hash(password, 10);

  // employee id
  let nextId = 1;
  const lastUser = await User.findOne().sort({ _id: -1 }); // Sort by creation date to find the last one
  if (lastUser) {
    const lastId = parseInt(lastUser.employeeId.slice(6));
    // Extract the numeric part from the customerID
    nextId = lastId + 1; // Increment the last numeric part
  }
  const employeeId = `EMPID-${nextId.toString().padStart(4, "0")}`;

  const newUser = new User({
    ...rest, // Spread other properties from data
    employeeId,
    password: hashedPassword, // Use hashed password
    role: "Support Agent", // Set default role
  });
  return newUser.save();
}

async function createSupportAgent(data, user) {
  const newSupportAgent = new SupportAgent({ ...data, user });
  return newSupportAgent.save();
}

exports.addSupportAgent = async (req, res, next) => {
  try {
    // Destructure and validate
    let data = cleanData(req.body);
    //   const data = req.body;

    const requiredFields = ["userName", "phoneNo", "email", "password"];
    const validationError = validateRequiredFields(requiredFields, data);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Check for duplicates
    const duplicateCheck = await checkDuplicateUser(
      data.userName,
      data.email,
      data.phoneNo
    );
    if (duplicateCheck) {
      return res.status(400).json({ message: ` ${duplicateCheck}` });
    }

    const supervisor = await Supervisor.findOne({ region: data.region, status: "Active" });

    // Check which manager is missing and send a specific error response
    if (!supervisor) {
      return res.status(404).json({
        message: "supervisor not found for the provided region.",
      });
    }
    const [ regionData] = await Promise.all([
      Region.findOne({ _id: data.region }).select('_id regionName'), // Fetch region data directly
    ]);

    // const emailSent = await sendCredentialsEmail(data.email, data.password,data.userName);

    // if (!emailSent) {
    //   return res
    //     .status(500)
    //     .json({ success: false, message: 'Failed to send login credentials email' });
    // }

    // Create user
    const newUser = await createUser(data);

    // Encrypt sensitive fields
    data = encryptSensitiveFields(data);

    data.status = "Active";

    // Create region manager
    const newSupportAgent = await createSupportAgent(data, newUser._id);

    logOperation(req, "Successfully", newSupportAgent._id);
    next();
    return res.status(201).json({
      message: "Support Agent added successfully",
      // userId: newUser._id,
      // SupportAgent: newSupportAgent._id,
      // newSupportAgent,
      employeeId:newUser.employeeId,
      region:{
        _id: regionData._id,
        regionName: regionData.regionName,
      }
    });
  } catch (error) {
    logOperation(req, "Failed");
    next();
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSupportAgent = async (req, res) => {
  try {
    const { id } = req.params;
 
    // Fetch the SupportAgent and populate fields
    const supportAgent = await SupportAgent.findById(id).populate([
      { path: "user", select: "userName phoneNo userImage email employeeId" },
      { path: "region", select: "regionName regionCode" },
      { path: "commission", select: "profileName" },
    ]);
 
    if (!supportAgent) {
      return res.status(404).json({ message: "Support Agent not found" });
    }
 
    // Check if there's a Supervisor with the same region
    const supervisor = await Supervisor.findOne({ region: supportAgent.region._id })
      .populate({ path: "user", select: "userName" }); // Fetch supervisor name
 
    // Decrypt fields if they exist
    const decryptField = (field) => (field ? decrypt(field) : field);
 
    supportAgent.adhaarNo = decryptField(supportAgent.adhaarNo);
    supportAgent.panNo = decryptField(supportAgent.panNo);
    if (supportAgent.bankDetails) {
      supportAgent.bankDetails.bankAccountNo = decryptField(
        supportAgent.bankDetails.bankAccountNo
      );
    }
 
    // Add supervisor details to the response
    const response = {
      ...supportAgent.toObject(),
      supervisor: supervisor
        ? { name: supervisor.user.userName, id: supervisor._id }
        : null,
    };
 
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching Support Agent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getAllSupportAgent = async (req, res) => {
  try {

    const userId = req.user.id;

    // Fetch user's role in a single query with selected fields
    const user = await User.findById(userId).select("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { role } = user;

    // Base query to find Bda
    let Query = {};

    if (["Super Admin", "Sales Admin", "Support Admin"].includes(role)) {
      // No additional filters for these roles
    } else if (role === "Supervisor") {
      // Fetch region ID in a single query
      const supervisor = await Supervisor.findOne({ user: userId }).select("region");
      if (!supervisor) {
        return res.status(404).json({ message: "Supervisor data not found" });
      }
      Query.region = supervisor.region;
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const supportAgent = await SupportAgent.find(Query).populate([
      { path: "user", select: "userName phoneNo userImage email" },
      { path: "region", select: "regionName" },
      { path: "commission", select: "profileName" },
    ]);

    // if (supportAgent.length === 0) {
    //   return res.status(404).json({ message: "No Support Agent found" });
    // }

    const totalSupportAgent = supportAgent.length;


    let query = {};

    if (["Super Admin", "Sales Admin", "Support Admin"].includes(role)) {
      // No additional filters for these roles
    }else if (role === "Supervisor") {
      // Fetch region ID in a single query
      const supervisor = await Supervisor.findOne({ user: userId }).select("_id");
      if (!supervisor) {
        return res.status(404).json({ message: "Supervisor data not found" });
      }
      query.supervisor = supervisor._id;
    }else if (role === "Support Agent") {
      // Fetch region ID in a single query
      const supportAgent = await SupportAgent.findOne({ user: userId }).select("_id");
      if (!supportAgent) {
        return res.status(404).json({ message: "Support Agent data not found" });
      }
      query.supportAgentId = supportAgent._id;
    }  else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

     // Fetch Licensers
     const tickets = await Ticket.find(query)

  //  if (!tickets.length) return res.status(404).json({ message: "No Leads found." });

   const totalTickets = tickets.length;
   const resolvedTickets = tickets.filter((ticket) => ticket.status === "Resolved").length;




    res.status(200).json({ 
      supportAgent,
      totalSupportAgent,
      totalTickets,
      resolvedTickets
     });
  } catch (error) {
    console.error("Error fetching all Support Agent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.editSupportAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    let data = cleanData(req.body);
    // Fetch the existing document to get the user field
    const existiSupportAgent = await SupportAgent.findById(id);
    if (!existiSupportAgent) {
      return res.status(404).json({ message: "Support Agent not found" });
    }

    // Extract the user field (ObjectId)
    const existingUserId = existiSupportAgent.user;

    // Validate required fields
    const requiredFields = ["userName", "phoneNo", "email"];
    const validationError = validateRequiredFields(requiredFields, data);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Check for duplicate user details, excluding the current document
    const duplicateCheck = await checkDuplicateUser(
      data.userName,
      data.email,
      data.phoneNo,
      existingUserId
    );
    if (duplicateCheck) {
      return res.status(400).json({ message: `Conflict: ${duplicateCheck}` });
    }

    const supervisor = await Supervisor.findOne({ region: data.region });

    // Check which manager is missing and send a specific error response
    if (!supervisor) {
      return res.status(404).json({
        message: "supervisor not found for the provided region.",
      });
    }
    const [ regionData] = await Promise.all([
      Region.findOne({ _id: data.region }).select('_id regionName'), // Fetch region data directly
    ]);
    // Encrypt sensitive fields
    data = encryptSensitiveFields(data);

    const user = await User.findById(existingUserId);
    Object.assign(user, data);
    await user.save();

    Object.assign(existiSupportAgent, data);
    const updatedSupportAgent = await existiSupportAgent.save();

    if (!updatedSupportAgent) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    res.status(200).json({
      message: "Support Agent updated successfully",
      region:{
        _id: regionData._id,
        regionName: regionData.regionName,
      }
    });
    logOperation(req, "Successfully", updatedSupportAgent._id);
    next();
  } catch (error) {
    console.error("Error editing Support Agent:", error);
    res.status(500).json({ message: "Internal server error" });
    logOperation(req, "Failed");
    next();
  }
};

exports.deleteSupportAgent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the support agent
    const supportAgent = await SupportAgent.findById(id);
    if (!supportAgent) {
      return res.status(404).json({ message: "Support agent not found" });
    }

    // Check if the support agent is used in the Ticket collection
    const dependentTickets = await Ticket.find({ supportAgentId: id });
    if (dependentTickets.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete support agent: They are associated with existing tickets.",
        tickets: dependentTickets.map((ticket) => ({
          id: ticket._id,
          subject: ticket.subject,
          status: ticket.status,
        })),
      });
    }

    // Retrieve the associated user ID
    const userId = supportAgent.user;

    // Delete the support agent
    const deletedSupportAgent = await SupportAgent.findByIdAndDelete(id);
    if (!deletedSupportAgent) {
      return res
        .status(404)
        .json({ message: "Support agent not found or already deleted." });
    }

    // Delete the associated user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ message: "Associated user not found or already deleted." });
    }

    // Log operation and send success response
    logOperation(req, "Successfully", deletedSupportAgent._id);
    next();
    return res.status(200).json({
      message: "Support agent and associated user deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting support agent:", error);

    // Log failure and respond with an error
    logOperation(req, "Failed");
    next();
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deactivateSupportagent = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract support agent ID from the request params
    const { status } = req.body; // Extract status from the request body
 
    // Validate the status
    if (!["Active", "Deactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value. Allowed values are 'Active' or 'Deactive'.",
      });
    }
 
    // Find the support agent
    const supportAgent = await SupportAgent.findById(id);
    if (!supportAgent) {
      return res.status(404).json({ message: "Support agent not found" });
    }
 
    // Check if the support agent is assigned to any ticket
    if (status === "Deactive") {
      const dependentTickets = await Ticket.find({ supportAgentId: id });
      if (dependentTickets.length > 0) {
        return res.status(400).json({
          message: "Cannot deactivate support agent: They are associated with existing tickets.",
          tickets: dependentTickets.map((ticket) => ({
            id: ticket._id,
            subject: ticket.subject,
            status: ticket.status,
          })),
        });
      }
    }
 
    // Update the support agent's status
    supportAgent.status = status;
    await supportAgent.save(); // Mongoose will automatically update `updatedAt` timestamp
 
    // Use the `updatedAt` field for logging
    const actionTime = supportAgent.updatedAt.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
 
    // Log the operation
    const activity = new ActivityLog({
      userId: req.user.id,
      operationId: id,
      activity: `${req.user.userName} Succesfully ${status}d Support Agent.`,
      timestamp: actionTime,
      action: status === "Active" ? "Activate" : "Deactivate",
      status,
      screen: "Support Agent",
    });
    await activity.save();
 
    // Respond with success
    return res.status(200).json({
      message: `Support agent status updated to ${status} successfully.`,
      supportAgent,
    });
  } catch (error) {
    console.error("Error updating support agent status:", error);
 
    // Log the failure and send an error response
    logOperation(req, "Failed");
    next()
    return res.status(500).json({ message: "Internal server error" });
  }
};
 

// Create a reusable transporter object using AWS SES
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // Use true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Skip TLS certificate validation (optional)
  },
});

// Function to send login credentials
const sendCredentialsEmail = async (email, password, userName) => {
  const mailOptions = {
    from: `"NexPortal" <${process.env.EMAIL}>`,
    to: email,
    subject: "Your NexPortal Login Credentials",
    text: `Dear ${userName},

Welcome to NexPortal – Sales & Support System.

Your account has been successfully created, Below are your login credentials:
  
Email: ${email}  
Password: ${password}  

Please note: These credentials are confidential. Do not share them with anyone.

To get started, log in to your account at:  
https://dev.nexportal.billbizz.cloud/  

If you have any questions or need assistance, please contact our support team.

Best regards,  
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Login credentials email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending login credentials email:", error);
    return false;
  }
};

// The CygnoNex Team
// NexPortal
// Support: notify@cygnonex.com


exports.getSupportAgentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    
    // Count total tickets assigned to the support agent
    const totalTickets = await Ticket.countDocuments({ supportAgentId: id });

    // Count tickets resolved by the support agent
    const ticketsResolved = await Ticket.countDocuments({
      supportAgentId: id,
      status: "Resolved",
    });

    const openTickets = await Ticket.find({
      supportAgentId: id,
      status: { $ne: "Resolved" },
    })
      .select("ticketId subject status priority customerId")
      .populate({
        path: "customerId",
        model: "Lead", // Specify the Leads collection
        select: "companyName organizationId", // Select only the required fields from Leads
      })
      .lean();
    
    // Get closed tickets
    const closedTickets = await Ticket.find({
      supportAgentId: id,
      status: "Resolved",
    })
      .select("ticketId subject status priority customerId")
      .populate({
        path: "customerId",
        model: "Lead", // Specify the Leads collection
        select: "companyName organizationId",
      })
      .lean();
    
      const rewards = await  Praise.find({ usersId : id })

    // Format tickets arrays
    const formatTickets = (tickets) =>
      tickets.map((ticket) => ({
        ticketId: ticket.ticketId,
        companyName: ticket.customerId?.companyName || "",
        organizationId: ticket.customerId?.organizationId || "",
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
      }));

    // Send response
    res.status(200).json({
      totalTickets,
      ticketsResolved,
      rewards,
      tickets: {
        openTickets: formatTickets(openTickets),
        closedTickets: formatTickets(closedTickets),
      },
    });
  } catch (error) {
    console.error("Error fetching support agent details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getTicketsOverTime = async (req, res) => {
  try {
    const { id } = req.params; // Support Agent ID
    const { date } = req.query; // Date for filtering (YYYY-MM-DD)
 
    // Validate the required parameters
    if (!date) {
      return res.status(400).json({ message: "Date query parameter is required" });
    }
 
    // Parse and validate the provided date
    const parsedDate = moment(date, "YYYY-MM-DD");
    if (!parsedDate.isValid()) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }
 
    const month = parsedDate.month(); // 0-based index
    const year = parsedDate.year();
    const daysInMonth = parsedDate.daysInMonth();
    const ticketsOverTime = [];
    let startDay = 1;
 
    // Loop through 5-day intervals
    while (startDay <= daysInMonth) {
      const endDay = Math.min(startDay + 4, daysInMonth); // Ensure we don't exceed month-end
      const startDate = moment({ year, month, day: startDay }).startOf("day").toDate();
      const endDate = moment({ year, month, day: endDay }).endOf("day").toDate();
 
      // Fetch ticket count for each interval
      const ticketCount = await Ticket.countDocuments({
        supportAgentId: new mongoose.Types.ObjectId(id), // 🛠 Fixed ObjectId issue
        createdAt: { $gte: startDate, $lte: endDate },
      });
 
      ticketsOverTime.push({
        date: moment({ year, month, day: endDay }).format("YYYY-MM-DD"),
        ticketCount,
      });
 
      startDay += 5; // Move to the next interval
    }
 
    // Send the response
    res.status(200).json({ ticketsOverTime });
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};