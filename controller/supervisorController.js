const User = require("../database/model/user");
const Region = require("../database/model/region");
const Commission = require("../database/model/commission");
const SupportAgent = require('../database/model/supportAgent'); 
const Supervisor = require("../database/model/supervisor");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { ObjectId } = require("mongoose").Types;
const nodemailer = require("nodemailer");
const Ticket = require("../database/model/ticket");
const ActivityLog = require('../database/model/activityLog')
const key = Buffer.from(process.env.ENCRYPTION_KEY, "utf8");
const iv = Buffer.from(process.env.ENCRYPTION_IV, "utf8");
const Feedback = require('../database/model/feedback')

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
    role: "Supervisor", // Set default role
  });
  return newUser.save();
}

async function createSupervisor(data, user) {
  const newSupervisor = new Supervisor({ ...data, user });
  return newSupervisor.save();
}

exports.addSupervisor = async (req, res, next) => {
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
      return res.status(400).json({ message: `Conflict: ${duplicateCheck}` });
    }

     // Check if the region is already assigned to another RegionManager
        const existingSupervisor= await Supervisor.findOne({ region: data.region });
        if (existingSupervisor) {
          return res.status(400).json({ message: "Region is already assigned to another Supervisor . Try adding another region." });
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
    const newSupervisor = await createSupervisor(data, newUser._id);

    logOperation(req, "Successfully", newSupervisor._id);
    next();
    return res.status(201).json({
      message: "Supervisor added successfully",
      // userId: newUser._id,
      // Supervisor: newSupervisor._id,
      // newSupervisor,
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

exports.addSupervisorCheck = async (req, res, next) => {
  try {
    const id = req.params.id
    // Check if the region is already assigned to another RegionManager
    const existingSupervisor= await Supervisor.findOne({ region: id });
    if (existingSupervisor) {
      return res.status(400).json({ message: "Region is already assigned to another Supervisor . Try adding another region." });
    }
    return res.status(201).json({
      message: "success"
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSupervisor = async (req, res) => {
  try {
    const { id } = req.params;

    const supervisor = await Supervisor.findById(id).populate([
      { path: "user", select: "userName phoneNo userImage email employeeId" },
      { path: "region", select: "regionName regionCode" },
      { path: "commission", select: "profileName" },
    ]);

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    const decryptField = (field) => (field ? decrypt(field) : field);

    supervisor.adhaarNo = decryptField(supervisor.adhaarNo);
    supervisor.panNo = decryptField(supervisor.panNo);
    if (supervisor.bankDetails) {
      supervisor.bankDetails.bankAccountNo = decryptField(
        supervisor.bankDetails.bankAccountNo
      );
    }

    res.status(200).json(supervisor);
  } catch (error) {
    console.error("Error fetching supervisor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllSupervisor = async (req, res) => {
  try {
    const supervisor = await Supervisor.find({}).populate([
      { path: "user", select: "userName phoneNo userImage email" },
      { path: "region", select: "regionName" },
      { path: "commission", select: "profileName" },
    ]);

    if (supervisor.length === 0) {
      return res.status(404).json({ message: "No supervisor found" });
    }

    res.status(200).json({ supervisor });
  } catch (error) {
    console.error("Error fetching all supervisor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.editSupervisor = async (req, res, next) => {
  try {
    const { id } = req.params;
    let data = cleanData(req.body);
    // Fetch the existing document to get the user field
    const existingSupervisor = await Supervisor.findById(id);
    if (!existingSupervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    // Extract the user field (ObjectId)
    const existingUserId = existingSupervisor.user;

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

    const supervisor = await Supervisor.findOne({
          region: data.region,
          _id: { $ne: req.params.id } // Exclude the current document being edited
        });
        
        if (supervisor) {
          return res.status(400).json({
            message: "Region is already assigned to another Supervisor. Try adding another Region."
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

    Object.assign(existingSupervisor, data);
    const updatedSupervisor = await existingSupervisor.save();

    if (!updatedSupervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    res.status(200).json({
      message: "Supervisor updated successfully",
      region:{
        _id: regionData._id,
        regionName: regionData.regionName,
      }
    });
    logOperation(req, "Successfully", updatedSupervisor._id);
    next();
  } catch (error) {
    console.error("Error editing Supervisor:", error);
    res.status(500).json({ message: "Internal server error" });
    logOperation(req, "Failed");
    next();
  }
};


exports.deleteSupervisor = async (req, res, next) => {
  try {
    const { id } = req.params;
 
    // Find the supervisor to get the region
    const supervisor = await Supervisor.findById(id);
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }
 
    const supervisorRegion = supervisor.region;
    const userId = supervisor.user; // The associated user ID
 
 
    // Check if there are any support agents in the same region
    const dependentAgents = await SupportAgent.find({ region: supervisorRegion });
    if (dependentAgents.length > 0) {
      return res.status(400).json({
        message: "Cannot delete supervisor: There are support agents associated with the same region.",
        supportAgents: dependentAgents.map(agent => ({
          id: agent._id,
          name: agent.userName,
          email: agent.personalEmail,
        })),
      });
    }
 
    // Delete the supervisor
    const deletedSupervisor = await Supervisor.findByIdAndDelete(id);
    if (!deletedSupervisor) {
      return res.status(404).json({ message: "Supervisor not found or already deleted." });
    }
 
    // Delete the associated user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "Associated user not found or already deleted." });
    }
   
    logOperation(req, "successfully", deletedSupervisor._id);
    next();
    return res.status(200).json({ message: "Supervisor deleted successfully" });
 
  } catch (error) {
    console.error("Error deleting supervisor:", error);
    logOperation(req, "Failed");
    next()
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deactivateSupervisor = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract supervisor ID
    const { status } = req.body; // Extract status from the request body
 
    // Validate the status
    if (!["Active", "Deactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value. Allowed values are 'Active' or 'Deactive'.",
      });
    }
 
    // Find the supervisor
    const supervisor = await Supervisor.findById(id);
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }
 
    const supervisorRegion = supervisor.region; // Get the supervisor's region
 
    // If deactivating, ensure no support agents are in the same region
    if (status === "Deactive") {
      const dependentAgents = await SupportAgent.find({ region: supervisorRegion,status: "Active" });
      if (dependentAgents.length > 0) {
        return res.status(400).json({
          message: "Cannot deactivate supervisor: There are support agents associated with the same region.",
          supportAgents: dependentAgents.map(agent => ({
            id: agent._id,
            name: agent.userName,
            email: agent.personalEmail,
          })),
        });
      }
    }
 
    // Update the supervisor's status
    supervisor.status = status;
    await supervisor.save(); // Mongoose will automatically update `updatedAt` timestamp
 
    // Use the `updatedAt` field for logging
    const actionTime = supervisor.updatedAt.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
 
    // Log the operation (only once)
    const activity = new ActivityLog({
      userId: req.user.id,
      operationId: id,
      activity: `${req.user.userName} Succesfully ${status}d Supervisor.`,
      timestamp: actionTime,
      action: status === "Active" ? "Activate" : "Deactivate",
      status,
      screen: "Supervisor",
    });
    await activity.save();
 
    // Respond with success
    return res.status(200).json({
      message: `Supervisor status updated to ${status} successfully.`,
      supervisor,
    });
  } catch (error) {
    console.error("Error updating supervisor status:", error);
    // Log the failure and respond with an error
    logOperation(req, "Failed");
    next();
    // Respond with failure
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


exports.getSupervisorDetails = async (req, res) => {
  try {
    const { id } = req.params; // Supervisor ID

    // Step 1: Fetch the Supervisor
    const supervisor = await Supervisor.findById(id).populate("user region");
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    // Step 2: Get Supervisor Details
    const supervisorName = supervisor.user?.userName || "N/A";
    const regionId = supervisor.region?._id;

    // Step 3: Find Support Agents in the Same Region
    const supportAgents = await SupportAgent.find({ region: regionId }).populate("user");

    let totalResolvedTickets = 0;
    let totalTicketsForResolutionRate = 0;
    let totalStarCount = 0;
    let totalFeedbacks = 0;
    let totalCompletedTasks = 0; // Track completed tasks (Resolved + Closed)
    let totalTasks = 0; // Track all tasks (tickets)

    // Step 4: Fetch Ticket and Feedback Details for Each Support Agent
    const supportAgentDetails = await Promise.all(
      supportAgents.map(async (agent) => {
        const agentUser = agent.user;

        // Total Tickets for the Support Agent
        const totalTickets = await Ticket.countDocuments({ supportAgentId: agent._id });

        // Resolved Tickets for the Support Agent
        const resolvedTickets = await Ticket.countDocuments({
          supportAgentId: agent._id,
          status: "Resolved",
        });

        // Completed Tasks (Resolved + Closed)
        const completedTasks = await Ticket.countDocuments({
          supportAgentId: agent._id,
          status: { $in: ["Resolved", "Closed"] },
        });

        // Fetch the detailed ticket information for each support agent
        const ticketDetails = await Ticket.find({ supportAgentId: agent._id })
          .select("ticketId subject status priority")
          .lean();

        // Fetch Feedback for the Support Agent
        const feedbacks = await Feedback.find({ supportAgentId: agent._id }).select("starCount");

        // Calculate Star Count Average
        let starTotal = 0;
        let starCountAverage = "N/A";
        if (feedbacks.length > 0) {
          starTotal = feedbacks.reduce((sum, feedback) => sum + parseFloat(feedback.starCount), 0);
          starCountAverage = (starTotal / feedbacks.length).toFixed(2);

          // Accumulate total star count and feedback count for overall calculation
          totalStarCount += starTotal;
          totalFeedbacks += feedbacks.length;
        }

        // Calculate Resolution Rate for the Support Agent
        const resolutionRate =
          totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(2) : "0";

        // Accumulate total resolved tickets and total tickets for overall calculation
        totalResolvedTickets += resolvedTickets;
        totalTicketsForResolutionRate += totalTickets;

        // Accumulate total tasks and completed tasks
        totalTasks += totalTickets;
        totalCompletedTasks += completedTasks;

        return {
          supportAgentId: agent._id,
          supportAgentName: agentUser?.userName || "N/A",
          supportAgentImage: agentUser?.userImage || "N/A",
          employeeId: agentUser?.employeeId || "N/A",
          resolutionRate: `${resolutionRate}%`,
          resolvedTicketsCount: resolvedTickets,
          ticketDetails,
          averageStarCount: starCountAverage,
          completedTasks, // New: Number of completed tasks per agent
        };
      })
    );

    // Step 5: Overall Resolution Rate for All Support Agents under the Supervisor
    const overallResolutionRate =
      totalTicketsForResolutionRate > 0
        ? ((totalResolvedTickets / totalTicketsForResolutionRate) * 100).toFixed(2)
        : "0";

    // Step 6: Total Ticket Summary for the Region
    const totalTickets = await Ticket.countDocuments({ region: regionId });
    const resolvedTickets = await Ticket.countDocuments({
      region: regionId,
      status: "Resolved",
    });
    const closedTickets = await Ticket.countDocuments({
      region: regionId,
      status: "Closed",
    });
    const openTickets = await Ticket.countDocuments({
      region: regionId,
      status: "Open",
    });
    const inProgressTickets = await Ticket.countDocuments({
      region: regionId,
      status: "In Progress",
    });

    // Step 7: Calculate Overall Star Count Average for the Supervisor's Team
    const overallStarCountAverage =
      totalFeedbacks > 0 ? (totalStarCount / totalFeedbacks).toFixed(2) : "N/A";

    // Step 8: Calculate Task Completion Percentage
    const taskCompletionPercentage =
      totalTasks > 0 ? ((totalCompletedTasks / totalTasks) * 100).toFixed(2) : "0";

    // Step 9: Respond with Supervisor and Support Agent Details
    res.status(200).json({
      supervisorDetails: {
        supervisorName,
        regionId,
        totalSupportAgents: supportAgents.length,
        overallResolutionRate: `${overallResolutionRate}%`,
        overallStarCountAverage,
        taskCompletionPercentage: `${taskCompletionPercentage}%`, // New: Task completion percentage
      },
      supportAgentDetails,
      ticketSummary: {
        totalTickets,
        resolvedTickets,
        closedTickets,
        openTickets,
        inProgressTickets,
      },
    });
  } catch (error) {
    console.error("Error fetching Supervisor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

