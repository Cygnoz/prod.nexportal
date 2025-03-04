const User = require("../database/model/user");
const Bda = require("../database/model/bda");
const Region = require("../database/model/region");
const Area = require("../database/model/area");
const Leads = require("../database/model/leads")
const Commission = require("../database/model/commission");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { ObjectId } = require("mongoose").Types;
const nodemailer = require("nodemailer");
const filterByRole = require("../services/filterByRole");
const AreaManager = require("../database/model/areaManager");
const RegionManager = require("../database/model/regionManager");
const Activity = require("../database/model/activity");
const ActivityLog = require('../database/model/activityLog')
const key = Buffer.from(process.env.ENCRYPTION_KEY, "utf8");
const iv = Buffer.from(process.env.ENCRYPTION_IV, "utf8");
const moment = require("moment");
const RenewalLicenser = require("../database/model/renewLicenser");

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
    role: "BDA", // Set default role
  });
  return newUser.save();
}

async function createBda(data, user) {
  const newBda = new Bda({ ...data, user });
  return newBda.save();
}

exports.addBda = async (req, res, next) => {
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

    const [regionManager, areaManager, regionData] = await Promise.all([
      RegionManager.findOne({ region: data.region , status: "Active"  }),
      AreaManager.findOne({ area: data.area , status: "Active" 
        
       }),
      Region.findOne({ _id: data.region }).select('_id regionName'), // Fetch region data directly
    ]);
    
   
    
        
        // Send specific error responses based on missing data
        if (!regionManager) {
          return res.status(404).json({ message: "Region Manager not found for the provided region." });
        }
        
        if (!areaManager) {
          return res.status(404).json({ message: "Area Manager not found for the provided area." });
        }

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
    const newBda = await createBda(data, newUser._id);

    logOperation(req, "Successfully", newBda._id);
    next();
    return res.status(201).json({
      message: "BDA added successfully",
      userId: newUser._id,
      bdaId: newBda._id,
      newBda,
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

exports.bdaCheck = async (req, res) => {
  try {
    const {regionId , areaId } = req.body
    
    const [regionManager, areaManager] = await Promise.all([
      RegionManager.findOne({ region: regionId }),
      AreaManager.findOne({ area: areaId })
    ]);
    
    // Send specific error responses based on missing data
    if (!regionManager) {
      return res.status(404).json({ message: "Region Manager not found for the provided region." });
    }
    
    if (!areaManager) {
      return res.status(404).json({ message: "Area Manager not found for the provided area." });
    }
    return res.status(201).json({
      message: "success"
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBda = async (req, res) => {
  try {
    const { id } = req.params;

    const bda = await Bda.findById(id).populate([
      { path: "user", select: "userName phoneNo userImage email employeeId" },
      { path: "region", select: "regionName regionCode" },
      { path: "area", select: "areaName areaCode" },
      { path: "commission", select: "profileName" },
    ]);
    if (!bda) {
      return res.status(404).json({ message: "BDA not found" });
    }

    const decryptField = (field) => (field ? decrypt(field) : field);

    bda.adhaarNo = decryptField(bda.adhaarNo);
    bda.panNo = decryptField(bda.panNo);
    if (bda.bankDetails) {
      bda.bankDetails.bankAccountNo = decryptField(
        bda.bankDetails.bankAccountNo
      );
    }

    res.status(200).json(bda);
  } catch (error) {
    console.error("Error fetching BDAr:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getAllBda = async (req, res) => {
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
    } else if (role === "Region Manager") {
      // Fetch region ID in a single query
      const regionManager = await RegionManager.findOne({ user: userId }).select("region");
      if (!regionManager) {
        return res.status(404).json({ message: "Region Manager data not found" });
      }
      Query.region = regionManager.region;
    } else if (role === "Area Manager") {
      // Fetch area ID in a single query
      const areaManager = await AreaManager.findOne({ user: userId }).select("area");
      if (!areaManager) {
        return res.status(404).json({ message: "Area Manager data not found" });
      }
      Query.area = areaManager.area;
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }
  
    // Fetch Bda data based on the filtered query
    const bda = await Bda.find(Query).populate([
      { path: "user", select: "userName phoneNo userImage email employeeId" },
      { path: "region", select: "regionName" },
      { path: "area", select: "areaName" },
      { path: "commission", select: "profileName" },
    ]);

    // if (!bda || bda.length === 0) {
    //   return res.status(404).json({ message: "No BDA found" });
    // }

    // Fetch Licensers
    const query = await filterByRole(userId);
    const leads = await Leads.find(query);

    // if (!leads.length) {
    //   return res.status(404).json({ message: "No Leads found." });
    // }

    // Calculate total counts
    const totalBda = bda.length;
    const totalLead = leads.filter((lead) => lead.customerStatus === "Lead").length;
    const totalTrial = leads.filter((lead) => lead.customerStatus === "Trial").length;
    const totalLicensors = leads.filter((lead) => lead.customerStatus === "Licenser").length;

    // Send the response
    res.status(200).json({
      bda,
      totalBda,
      totalLead,
      totalTrial,
      totalLicensors,
    });
  } catch (error) {
    console.error("Error fetching Bda data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// exports.getAllBda = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Fetch user's role in a single query with selected fields
//     const user = await User.findById(userId).select("role");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const { role } = user;

//     // Base query to find Bda
//     let Query = {};

//     if (["Super Admin", "Sales Admin", "Support Admin"].includes(role)) {
//       // No additional filters for these roles
//     } else if (role === "Region Manager") {
//       // Fetch region ID in a single query
//       const regionManager = await RegionManager.findOne({ user: userId }).select("region");
//       if (!regionManager) {
//         return res.status(404).json({ message: "Region Manager data not found" });
//       }
//       Query.region = regionManager.region;
//     } else if (role === "Area Manager") {
//       // Fetch area ID in a single query
//       const areaManager = await AreaManager.findOne({ user: userId }).select("area");
//       if (!areaManager) {
//         return res.status(404).json({ message: "Area Manager data not found" });
//       }
//       Query.area = areaManager.area;
//     } else {
//       return res.status(403).json({ message: "Unauthorized role" });
//     }

//     // Fetch Bda data based on the filtered query
//     const bda = await Bda.find(Query).populate([
//       { path: "user", select: "userName phoneNo userImage email employeeId" },
//       { path: "region", select: "regionName" },
//       { path: "area", select: "areaName" },
//       { path: "commission", select: "profileName" },
//     ]);

//     if (!bda || bda.length === 0) {
//       return res.status(404).json({ message: "No BDA found" });
//     }

//     const query = await filterByRole(userId);
// console.log(query);

//     // Fetch Licensers
//     const leads = await Leads.find(query)

//     if (!leads.length) return res.status(404).json({ message: "No Leads found." });

//     res.status(200).json({ bda,leads });
//   } catch (error) {
//     console.error("Error fetching Bda data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// exports.getAllBda = async (req, res) => {
//   try {
//     const userId = req.user.id;
    

//     const bda = await Bda.find(query).populate([
//       { path: "user", select: "userName phoneNo userImage email employeeId" },
//       { path: "region", select: "regionName" },
//       { path: "area", select: "areaName" },
//       { path: "commission", select: "profileName" },
//     ]);
//     if (bda.length === 0) {
//       return res.status(404).json({ message: "No BDA found" });
//     }

//     res.status(200).json({ bda });
//   } catch (error) {
//     console.error("Error fetching all Bda:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.editBda = async (req, res, next) => {
  try {
    const { id } = req.params;
    let data = cleanData(req.body);
    // Fetch the existing document to get the user field
    const existingBda = await Bda.findById(id);
    if (!existingBda) {
      return res.status(404).json({ message: "BDA not found" });
    }

    // Extract the user field (ObjectId)
    const existingUserId = existingBda.user;

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

    const [ regionData] = await Promise.all([
      Region.findOne({ _id: data.region }).select('_id regionName'), // Fetch region data directly
    ]);
    // Encrypt sensitive fields
    data = encryptSensitiveFields(data);

    const user = await User.findById(existingUserId);
    Object.assign(user, data);
    await user.save();

    Object.assign(existingBda, data);
    const updatedBda = await existingBda.save();

    if (!updatedBda) {
      return res.status(404).json({ message: "BDA not found" });
    }

    res.status(200).json({
      message: "BDA updated successfully",
      region:{
        _id: regionData._id,
        regionName: regionData.regionName,
      }
    });
    logOperation(req, "Successfully", updatedBda._id);
    next();
  } catch (error) {
    console.error("Error editing BDA:", error);
    res.status(500).json({ message: "Internal server error" });
    logOperation(req, "Failed");
    next();
  }
};

exports.deleteBda = async (req, res, next) => {
  try {
    const { id } = req.params;
 
 
    // Check if the BDA exists
    const bda = await Bda.findById(id);
    if (!bda) {
      return res.status(404).json({ message: "BDA not found." });
    }
 
    // Check if the BDA is referenced in the Leads collection
    const lead = await Leads.findOne({ bdaId: id });
    if (lead) {
      return res.status(400).json({
        message: "Cannot delete BDA because it is referenced in Leads.",
      });
    }
 
    // Delete the associated User
    const userId = bda.user;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({
        message: "Associated User not found or already deleted.",
      });
    }
 
    // Delete the BDA
    const deletedBda = await Bda.findByIdAndDelete(id);
    if (!deletedBda) {
      return res.status(404).json({ message: "BDA not found or already deleted." });
    }
 
    // Log success and return response
    res.status(200).json({
      message: "BDA and associated User deleted successfully.",
    });
    logOperation(req, "Successfully", deletedBda._id);
    next();
 
  } catch (error) {
    console.error("Error deleting BDA:", error.message || error);
    res.status(500).json({ message: "Internal server error." });
    logOperation(req, "Failed");
    next();
  }
};

exports.deactivateBda = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
 
    // Validate the status
    if (!["Active", "Deactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value. Allowed values are 'Active' or 'Deactive'.",
      });
    }
 
    // Check if the BDA exists
    const bda = await Bda.findById(id);
    if (!bda) {
      return res.status(404).json({ message: "BDA not found." });
    }
 
    // If deactivating, check lead association and status
    if (status === "Deactive") {
      const associatedLeads = await Leads.find({ bdaId: id });
 
      // If leads exist, check their statuses
      if (associatedLeads.length > 0) {
        const nonWonLeads = associatedLeads.filter(lead => lead.leadStatus !== "Won");
 
        if (nonWonLeads.length > 0) {
          return res.status(400).json({
            message: "Cannot deactivate BDA: Some leads associated with this BDA do not have a 'Won' status.",
            nonWonLeads: nonWonLeads.map(lead => ({
              id: lead._id,
              name: lead.fullName || `${lead.firstName} ${lead.lastName}`,
              leadStatus: lead.leadStatus,
            })),
          });
        }
      }
    }
 
    // Update the BDA's status
    bda.status = status;
    await bda.save();
 
    // Get action time safely
    const actionTime = bda.updatedAt
      ? bda.updatedAt.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      : new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
 
    // Log the operation
    const activity = new ActivityLog({
      userId: req.user.id,
      operationId: id,
      activity: `${req.user.userName} successfully ${status}d BDA.`,
      timestamp: actionTime,
      action: status === "Active" ? "Activate" : "Deactivate",
      status,
      screen: "BDA",
    });
    await activity.save();
 
    return res.status(200).json({
      message: `BDA status updated to ${status} successfully.`,
      bda,
    });
  } catch (error) {
    console.error("Error updating BDA status:", error);
    return res.status(500).json({ message: "Internal server error." });
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

// exports.getBdaDetails = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch BDA details
//     const bda = await Bda.findById(id)
//   .select("user region area commission") // Only fetch these fields from the bda collection
//   .populate([
//     { path: "user", select: "userName phoneNo userImage email employeeId" },
//     { path: "region", select: "regionName regionCode" },
//     { path: "area", select: "areaName areaCode" },
//     { path: "commission", select: "profileName" },
//   ]);

//     if (!bda) {
//       return res.status(404).json({ message: "BDA not found" });
//     }

//     // Decrypt sensitive fields (if necessary)
//     const decryptField = (field) => (field ? decrypt(field) : field);
//     bda.adhaarNo = decryptField(bda.adhaarNo);
//     bda.panNo = decryptField(bda.panNo);
//     if (bda.bankDetails) {
//       bda.bankDetails.bankAccountNo = decryptField(bda.bankDetails.bankAccountNo);
//     }

//     // Get total leads assigned
//     const totalLeadsAssigned = await Leads.countDocuments({ bdaId: id });

//     // Get total licenses sold
//     const totalLicensesSold = await Leads.countDocuments({
//       bdaId: id,
//       customerStatus: "Licenser",
//     });

//     // Get pending tasks
//     const leads = await Leads.find({ bdaId: id }, "_id");
//     const leadIds = leads.map((lead) => lead._id);

//     const pendingTasks = await Activity.countDocuments({
//       leadId: { $in: leadIds },
//       activityType: "Task",
//       taskStatus: { $ne: "In Progress" },
//     });

//     // Get lead by status
//     const leadByStatus = {
//       open: await Leads.countDocuments({ bdaId: id, leadStatus: "Contacted" }),
//       inProgress: await Leads.countDocuments({ bdaId: id, leadStatus: "In Progress" }),
//       converted: await Leads.countDocuments({ bdaId: id, customerStatus: { $ne: "Lead" } }),
//       dropped: await Leads.countDocuments({ bdaId: id, leadStatus: "Lost" }),
//     };

//     // Send response
//     res.status(200).json({
//       bda,
//       totalLeadsAssigned,
//       totalLicensesSold,
//       pendingTasks,
//       leadByStatus,
//     });
//   } catch (error) {
//     console.error("Error fetching BDA details:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


// exports.getLeadDetails = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch LeadDetails
//     const leadDetails = await Leads.find(
//       { bdaId: id, customerStatus: "Lead" },
//       "_id customerId firstName phone email leadSource createdAt leadStatus"
//     );

//     // Fetch TrialDetails
//     const trialDetails = await Leads.find(
//       { bdaId: id, customerStatus: "Trial" },
//       "_id customerId firstName trialStatus startDate endDate"
//     );

//     // Fetch LicenserDetails
//     const licenserDetails = await Leads.find(
//       { bdaId: id, customerStatus: "Licenser" },
//       "_id firstName licensorStatus startDate endDate"
//     );

//     // Check if no details found
//     if (!leadDetails.length && !trialDetails.length && !licenserDetails.length) {
//       return res.status(404).json({ message: "No details found for this BDA" });
//     }

//     // Send response
//     res.status(200).json({
//       LeadDetails: leadDetails,
//       TrialDetails: trialDetails,
//       LicenserDetails: licenserDetails,
//     });
//   } catch (error) {
//     console.error("Error fetching details:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };



// Helper function to get BDA details
const getBdaDetails = async (id) => {
  try {
    // Fetch BDA details
    const bda = await Bda.findById(id)
      .select("user region area commission")
      .populate([
        { path: "user", select: "userName phoneNo userImage email employeeId" },
        { path: "region", select: "regionName regionCode" },
        { path: "area", select: "areaName areaCode" },
        { path: "commission", select: "profileName" },
      ]);

    if (!bda) {
      return { error: "BDA not found", status: 404 };
    }

    // Decrypt sensitive fields (if necessary)
    const decryptField = (field) => (field ? decrypt(field) : field);
    bda.adhaarNo = decryptField(bda.adhaarNo);
    bda.panNo = decryptField(bda.panNo);
    if (bda.bankDetails) {
      bda.bankDetails.bankAccountNo = decryptField(bda.bankDetails.bankAccountNo);
    }

    // Get total leads assigned
    const totalLeadsAssigned = await Leads.countDocuments({ bdaId: id });

    // Get total licenses sold
    const totalLicensesSold = await Leads.countDocuments({
      bdaId: id,
      customerStatus: "Licenser",
    });

    // Get pending tasks
    const leads = await Leads.find({ bdaId: id }, "_id");
    const leadIds = leads.map((lead) => lead._id);

    const pendingTasks = await Activity.countDocuments({
      leadId: { $in: leadIds },
      activityType: "Task",
      taskStatus: { $ne: "In Progress" },
    });

    // Get lead by status
    const leadByStatus = {
      open: await Leads.countDocuments({ bdaId: id, leadStatus: "Contacted" }),
      inProgress: await Leads.countDocuments({ bdaId: id, leadStatus: "In Progress" }),
      converted: await Leads.countDocuments({ bdaId: id, customerStatus: { $ne: "Lead" } }),
      dropped: await Leads.countDocuments({ bdaId: id, leadStatus: "Lost" }),
    };

    return {
      bda,
      totalLeadsAssigned,
      totalLicensesSold,
      pendingTasks,
      leadByStatus,
    };
  } catch (error) {
    console.error("Error fetching BDA details:", error);
    return { error: "Internal server error", status: 500 };
  }
};

// Controller function to get Lead details along with BDA details
exports.getLeadDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Call the getBdaDetails function
    const bdaDetails = await getBdaDetails(id);

    // Handle error from getBdaDetails
    if (bdaDetails.error) {
      return res.status(bdaDetails.status).json({ message: bdaDetails.error });
    }

    // Fetch LeadDetails
    const leadDetails = await Leads.find(
      { bdaId: id, customerStatus: "Lead" },
      "_id customerId firstName phone email leadSource createdAt leadStatus"
    );

    // Fetch TrialDetails
    const trialDetails = await Leads.find(
      { bdaId: id, customerStatus: "Trial" },
      "_id customerId firstName trialStatus startDate endDate"
    );

    // Fetch LicenserDetails
    const licenserDetails = await Leads.find(
      { bdaId: id, customerStatus: "Licenser" },
      "_id firstName licensorStatus startDate endDate"
    );

    // Check if no details found
    if (!leadDetails.length && !trialDetails.length && !licenserDetails.length) {
      return res.status(404).json({ message: "No details found for this BDA" });
    }

    // Send response
    res.status(200).json({
      bdaDetails,
      LeadDetails: leadDetails,
      TrialDetails: trialDetails,
      LicenserDetails: licenserDetails,
    });
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getTrialConvertedOverTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // Validate date input
    if (!date) {
      return res.status(400).json({ message: "Date query parameter is required" });
    }

    // Parse and validate the provided date
    const parsedDate = moment(date, "YYYY-MM-DD");
    if (!parsedDate.isValid()) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    const month = parsedDate.month(); // 0-indexed month
    const year = parsedDate.year();
    const daysInMonth = parsedDate.daysInMonth();

    const trialConvertedOverTime = [];
    let startDay = 1;

    // Group data into 5-day intervals
    while (startDay <= daysInMonth) {
      const endDay = Math.min(startDay + 4, daysInMonth); // Ensure we don't exceed month-end

      const endDate = moment({ year, month, day: endDay }).format("YYYY-MM-DD");

      // Sum conversion counts for the interval
      const conversionCount = await Leads.countDocuments({
        bdaId: id,
        trialDate: { $gte: moment({ year, month, day: startDay }).format("YYYY-MM-DD"), $lte: endDate },
      });

      trialConvertedOverTime.push({
        date: endDate, // Use the last date of the interval as the key
        conversionCount,
      });

      startDay += 5; // Move to the next interval
    }

    // Respond with the results
    res.status(200).json({ trialConvertedOverTime });
  } catch (error) {
    console.error("Error fetching trial conversion details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBdaRenewalCount = async (req, res) => {
  try {
    const { bdaId } = req.params; // BDA ID from params
    const { year } = req.query; // Year from query
 
    if (!bdaId) {
      return res.status(400).json({ error: "BDA ID is required." });
    }
 
    if (!year || isNaN(parseInt(year))) {
      return res.status(400).json({ error: "Valid year is required as a query parameter." });
    }
 
    const numericYear = parseInt(year, 10);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
 
    let results = [];
 
    for (let m = 0; m < 12; m++) {
      const startDate = moment.utc({ year: numericYear, month: m, day: 1 }).startOf("month");
      const endDate = moment.utc(startDate).endOf("month");
 
      // Find licensers under the given BDA
      const licenserIds = await Leads.find({
        bdaId: bdaId,
        customerStatus: "Licenser"
      }).distinct("_id");
 
      // Count renewals for those licensers in the current month
      const renewalCount = await RenewalLicenser.countDocuments({
        licenser: { $in: licenserIds },
        renewalDate: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
      });
 
      results.push({
        month: monthNames[m],
        renewalCount
      });
    }
 
    return res.status(200).json({
      message: "Renewal counts retrieved successfully",
      data: results
    });
  } catch (error) {
    console.error("Error fetching renewal counts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};