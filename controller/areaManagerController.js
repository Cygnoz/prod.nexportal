const User = require("../database/model/user");
const Leads = require("../database/model/leads")
const Region = require("../database/model/region");
const Area = require("../database/model/area");
const Commission = require("../database/model/commission");
const AreaManager = require("../database/model/areaManager");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { ObjectId } = require("mongoose").Types;
const nodemailer = require("nodemailer");
const RegionManager = require("../database/model/regionManager");
const filterByRole = require("../services/filterByRole");
const regionManager = require("../database/model/regionManager");
const Bda = require("../database/model/bda");
const ActivityLog = require('../database/model/activityLog')
const key = Buffer.from(process.env.ENCRYPTION_KEY, "utf8");
const iv = Buffer.from(process.env.ENCRYPTION_IV, "utf8");
const moment = require('moment'); 
const Supervisor = require('../database/model/supervisor')
const SupportAgent = require('../database/model/supportAgent')


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
    role: "Area Manager", // Set default role
  });
  return newUser.save();
}

async function createAreaManager(data, user) {
  const newAreaManager = new AreaManager({ ...data, user });
  return newAreaManager.save();
}

exports.addAreaManager = async (req, res, next) => {
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

    const existingAreaManager = await AreaManager.findOne({ area: data.area });
        if (existingAreaManager) {
          return res.status(400).json({ message: "Area is already assigned to another Area Manager. Try adding another Area." });
        }

        const [regionManager, regionData] = await Promise.all([
          RegionManager.findOne({ region: data.region ,status: "Active"  }),
          Region.findOne({ _id: data.region }).select('_id regionName'), // Fetch region data directly
        ]);
        
        //  const [regionManager] = await Promise.all([
        //           RegionManager.findOne({ region: data.region })
        //         ]);
                
        //         // Send specific error responses based on missing data
                if (!regionManager) {
                  return res.status(404).json({ message: "Region Manager not found for the provided region." });
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
    const newAreaManager = await createAreaManager(data, newUser._id);

    logOperation(req, "Successfully", newAreaManager._id);
    next();
    return res.status(201).json({
      message: "Area Manager added successfully",
      // userId: newUser._id,
      // areaManagerId: newAreaManager._id,
      // newAreaManager,
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

// exports.addAreaManagerCheck = async (req, res) => {
//   try {
//     const {regionId , areaId } = req.body
    
//     const regionManager = await RegionManager.findOne({ region: regionId });
    
//     // Send specific error responses based on missing data
//     if (!regionManager) {
//       return res.status(404).json({ message: "Region Manager not found for the provided region." });
//     }
//     const existingAreaManager = await AreaManager.findOne({ area: areaId });
//         if (existingAreaManager) {
//           return res.status(400).json({ message: "Area is already assigned to another Area Manager. Try adding another Area." });
//         }
//     return res.status(201).json({
//       message: "success"
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


exports.addAreaManagerCheck = async (req, res) => {
  try {
    const { regionId, areaId } = req.body;

    // Validate required fields
    if (!regionId) {
      return res.status(400).json({ message: "regionId is required." });
    }
    if (!areaId) {
      return res.status(400).json({ message: "areaId is required." });
    }

    // Check if Region Manager exists for the provided region
    const regionManager = await RegionManager.findOne({ region: regionId });
    if (!regionManager) {
      return res.status(404).json({ message: "Region Manager not found for the provided region." });
    }

    // Check if the area is already assigned to another Area Manager
    const existingAreaManager = await AreaManager.findOne({ area: areaId });
    if (existingAreaManager) {
      return res.status(400).json({ message: "Area is already assigned to another Area Manager. Try adding another Area." });
    }

    // Success response
    return res.status(201).json({
      message: "Success",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




exports.getAreaManager = async (req, res) => {
  try {
    const { id } = req.params;

    const areaManager = await AreaManager.findById(id).populate([
      { path: "user", select: "userName phoneNo userImage email employeeId" },
      { path: "region", select: "regionName regionCode" },
      { path: "area", select: "areaName areaCode" },
      { path: "commission", select: "profileName" },
    ]);
    if (!areaManager) {
      return res.status(404).json({ message: "Area Manager not found" });
    }

    const decryptField = (field) => (field ? decrypt(field) : field);

    areaManager.adhaarNo = decryptField(areaManager.adhaarNo);
    areaManager.panNo = decryptField(areaManager.panNo);
    if (areaManager.bankDetails) {
      areaManager.bankDetails.bankAccountNo = decryptField(
        areaManager.bankDetails.bankAccountNo
      );
    }

    res.status(200).json(areaManager);
  } catch (error) {
    console.error("Error fetching Area Manager:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.getAllAreaManager = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's role in a single query with selected fields
    const user = await User.findById(userId).select("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { role } = user;

    // Base query to find Area Managers
    let Query = {};
    let query = {} 

    if (["Super Admin", "Sales Admin", "Support Admin"].includes(role)) {
      // No additional filters for these roles
    } else if (role === "Region Manager") {
      // Fetch region ID in a single query
      const regionManager = await RegionManager.findOne({ user: userId }).select("region");
      if (!regionManager) {
        return res.status(404).json({ message: "Region Manager data not found" });
      }
      Query.region = regionManager.region;
      query.regionId = Query.region

    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    // Fetch Area Manager data based on the filtered query
    const areaManagers = await AreaManager.find(Query).populate([
      { path: "user", select: "userName phoneNo userImage email employeeId" },
      { path: "region", select: "regionName" },
      { path: "area", select: "areaName" },
      { path: "commission", select: "profileName" },
    ]);

    // Calculate total counts
    const totalAreaManagers = areaManagers.length;
    const totalBda = (await Bda.find(Query)).length;
    
    const leads = await Leads.find(query)

const totalLeads = leads.filter((lead) => lead.customerStatus === "Lead").length;
const totalLicensors = leads.filter((lead) => lead.customerStatus === "Licenser").length;

    // Send the response
    res.status(200).json({
      areaManagers,
      totalAreaManagers,
      totalBda,
      totalLeads,
      totalLicensors
    });

  } catch (error) {
    console.error("Error fetching Area Manager data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.editAreaManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    let data = cleanData(req.body);
    // Fetch the existing document to get the user field
    const existingAreaManager = await AreaManager.findById(id);
    if (!existingAreaManager) {
      return res.status(404).json({ message: "Area Manager not found" });
    }

    // Extract the user field (ObjectId)
    const existingUserId = existingAreaManager.user;

    // Validate required fields
    const requiredFields = ["userName", "phoneNo", "email"];
    const validationError = validateRequiredFields(requiredFields, data);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const areaManager = await AreaManager.findOne({
      area: data.area,
      _id: { $ne: req.params.id } // Exclude the current document being edited
    });
    
    if (areaManager) {
      return res.status(400).json({
        message: "Area is already assigned to another Area Manager. Try adding another Area."
      });
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

    Object.assign(existingAreaManager, data);
    const updatedAreaManager = await existingAreaManager.save();

    if (!updatedAreaManager) {
      return res.status(404).json({ message: "Area Manager not found" });
    }

    res.status(200).json({
      message: "Area Manager updated successfully",
      region:{
        _id: regionData._id,
        regionName: regionData.regionName,
      }
    });
    logOperation(req, "Successfully", updatedAreaManager._id);
    next();
  } catch (error) {
    console.error("Error editing Area Manager:", error);
    res.status(500).json({ message: "Internal server error" });
    logOperation(req, "Failed");
    next();
  }
};

exports.deleteAreaManager = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the Area Manager exists
    const areaManager = await AreaManager.findById(id);
    if (!areaManager) {
      return res.status(404).json({ message: "Area Manager not found." });
    }
 
    // Check if the Area Manager is referenced in the Leads collection
    const lead = await Leads.findOne({ areaManager: id });
    if (lead) {
      return res.status(400).json({
        message: "Cannot delete Area Manager because it is referenced in Leads.",
      });
    }
 
    // Delete the associated User
    const userId = areaManager.user;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({
        message: "Associated User not found or already deleted.",
      });
    }
 
    // Delete the Area Manager
    const deletedAreaManager = await AreaManager.findByIdAndDelete(id);
    if (!deletedAreaManager) {
      return res.status(404).json({ message: "Area Manager not found or already deleted." });
    }
 
    // Log success and return response
    res.status(200).json({
      message: "Area Manager and associated User deleted successfully.",
    });
    logOperation(req, "Successfull", deletedAreaManager._id);
    next();
 
  } catch (error) {
    console.error("Error deleting Area Manager:", error.message || error);
    res.status(500).json({ message: "Internal server error." });
    logOperation(req, "Failed");
    next();
  }
};

exports.deactivateAreamanager = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract Area Manager ID
    const { status } = req.body; // Extract status from the request body
 
    // Validate the status
    if (!["Active", "Deactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value. Allowed values are 'Active' or 'Deactive'.",
      });
    }
 
    // Find the Area Manager
    const areaManager = await AreaManager.findById(id);
    if (!areaManager) {
      return res.status(404).json({ message: "Area Manager not found." });
    }
 
    // Check if the Area Manager is associated with any leads when deactivating
    if (status === "Deactive") {
      const associatedLeads = await Leads.find({ areaManager: id });
      if (associatedLeads.length > 0) {
        return res.status(400).json({
          message: "Cannot deactivate Area Manager: There are leads associated with this Area Manager.",
          leads: associatedLeads.map(lead => ({
            id: lead._id,
            name: lead.name,
            status: lead.status,
          })),
        });
      }
    }
 
    // Update the Area Manager's status
    areaManager.status = status;
    await areaManager.save(); // Mongoose will update the `updatedAt` timestamp
 
    // Use the `updatedAt` field for logging
    const actionTime = areaManager.updatedAt.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
 
    // Log the operation
    const activity = new ActivityLog({
      userId: req.user.id,
      operationId: id,
      activity: `${req.user.userName} Succesfully ${status}d Area Manager.`,
      timestamp: actionTime,
      action: status === "Active" ? "Activate" : "Deactivate",
      status,
      screen: "Area Manager",
    });
    await activity.save();
 
    // Respond with success
    return res.status(200).json({
      message: `Area Manager status updated to ${status} successfully.`,
      areaManager,
    });
  } catch (error) {
    console.error("Error updating Area Manager status:", error);
 
    // Log the failure and respond with an error
    logOperation(req, "Failed");
    next();
    return res.status(500).json({ message: "Internal server error." });
  }
};



exports.getAreaManagerConversionOverTime = async (req, res) => {
  try {
    const { id } = req.params;
    let { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date is required as a query parameter in format yyyy-mm-dd" });
    }
   
    if (date.length >= 10) {
      date = date.slice(0, 7);
    }
   
    const year = parseInt(date.slice(0, 4), 10);
    const month = parseInt(date.slice(5, 7), 10);
    if (isNaN(year) || isNaN(month)) {
      return res.status(400).json({ error: "Invalid date format. Use yyyy-mm-dd." });
    }
   
    const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();
    const areaManager = await AreaManager.findById(id);
    if (!areaManager) {
      return res.status(404).json({ error: "Area Manager not found." });
    }
   
    let convertedOverTime = [];
    for (let startDay = 1; startDay <= daysInMonth; startDay += 5) {
      const intervalStart = moment(`${year}-${month}-${startDay}`, "YYYY-MM-DD").toISOString();
      let endDay = Math.min(startDay + 4, daysInMonth);
      const intervalEnd = moment(`${year}-${month}-${endDay + 1}`, "YYYY-MM-DD").toISOString();
     
      let repDay = endDay;
      const repDate = moment(`${year}-${month}-${repDay}`, "YYYY-MM-DD").format("YYYY-MM-DD");
     
      const conversionCount = await Leads.countDocuments({
        areaManager: areaManager._id,
        customerStatus: "Licenser",
        licensorDate: {
          $gte: intervalStart,
          $lt: intervalEnd
        }
      });
     
      convertedOverTime.push({
        date: repDate,
        conversionCount
      });
    }
   
    return res.status(200).json({ convertedOverTime });
  } catch (error) {
    console.error("Error fetching conversion over time:", error);
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
exports.getAreaManagerDetails = async (req, res) => {
  try {
    const { id } = req.params; // `id` is the AreaManager ID
 
    // Step 1: Fetch the AreaManager
    const areaManager = await AreaManager.findById(id).populate("user");
    if (!areaManager) {
      return res.status(404).json({ message: "Area Manager not found" });
    }
 
    // Step 2: Extract the area ID and AreaManager's name
    const areaId = areaManager.area;
    const areaManagerName = areaManager.user?.userName || "N/A";
 
    // Step 3: Calculate total leads (all leads under this AreaManager)
    const totalLeads = await Leads.countDocuments({
      areaId,
     customerStatus: { $nin: ["Trial", "Licenser"] }, // Exclude "Trial" and "Licenser"
   });
 
 
   const leadStatuses = ["New", "Contacted", "Lost", "In Progress", "Won"];
 
   const leadStatusDetails = await Promise.all(
   leadStatuses.map(async (status) => {
    const count = await Leads.countDocuments({
      areaId,
      leadStatus: status,
      customerStatus: "Lead", // Filter by customerStatus "Lead"
     });
 
     const percentage =
      totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(2) : "0.00";
 
     return {
      status,
      count,
      percentage: `${percentage}%`,
    };
  })
);
 
    // Step 5: Calculate converted leads and licensers
    const convertedLeads = await Leads.countDocuments({
      areaId,
      customerStatus: { $in: ["Trial", "Licenser"] },
    });
    const totalCustomers = await Leads.countDocuments({ areaId });
    const totalLicensers = await Leads.countDocuments({
      areaId,
      customerStatus: "Licenser",
    });
 
    const areaManagerConversionRate =
      totalCustomers > 0
        ? Math.min(((convertedLeads / totalCustomers) * 100).toFixed(2), 100)
        : "0";
 
    // Step 6: Fetch BDAs under the given area
    const bdas = await Bda.find({ area: areaId });
 
    // Step 7: Prepare BDA details with conversion rates
    const bdaDetails = await Promise.all(
      bdas.map(async (bda) => {
        const bdaUser = await User.findById(bda.user);
        const totalLeadsForBda = await Leads.countDocuments({ bdaId: bda._id });
        const convertedLeadsForBda = await Leads.countDocuments({
          bdaId: bda._id,
          customerStatus: { $ne: "Lead" },
        });
        const bdaConversionRate =
          totalLeadsForBda > 0
            ? Math.min(((convertedLeadsForBda / totalLeadsForBda) * 100).toFixed(2), 100)
            : "0";
 
        const area = await Area.findById(bda.area);
 
        return {
          bdaId: bda._id,
          bdaName: bdaUser?.userName || "N/A",
          leadsAssigned: totalLeadsForBda,
          bdaConversionRate: `${bdaConversionRate}%`,
          areaName: area?.areaName || "N/A",
        };
      })
    );
 
    // Step 8: Fetch licensers under the AreaManager
    const licensers = await Leads.find({
      areaId,
      customerStatus: "Licenser",
    }).select("firstName licensorStatus startDate endDate");
 
    const licenserDetails = licensers.map((licenser) => ({
      _id: licenser._id,
      firstName: licenser.firstName,
      licensorStatus: licenser.licensorStatus,
      startDate: licenser.startDate,
      endDate: licenser.endDate,
    }));
 
    // Step 9: Total BDA count
    const totalBdaCount = bdas.length;
 
    // Step 10: Response with all details
    res.status(200).json({
      areaManagerDetails: {
        areaManagerName,
        areaId,
        areaManagerConversionRate: `${areaManagerConversionRate}%`,
      },
      totalLeads,
      totalCustomers,
      totalLicensers,
      totalBdaCount,
      leadStatusDetails, // Added lead status details
      bdaDetails,
      licenserDetails,
    });
  } catch (error) {
    console.error("Error fetching Area Manager details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
 


exports.getCommissionProfile = async (req, res) => {
  try {
    const { id } = req.params; // Get the user ID from params
 
    // List of all models that might have a commission field
    const models = [RegionManager, AreaManager, Bda, Supervisor, SupportAgent];
 
    let userWithCommission = null;
 
    // Loop through models to find the user in any of them
    for (const model of models) {
      userWithCommission = await model.findById(id).populate("commission");
      if (userWithCommission) break; // Stop if user is found
    }
 
    // If user not found in any schema, return an error
    if (!userWithCommission) {
      return res.status(404).json({ message: "User not found in any manager role." });
    }
 
    // If the user does not have a commission assigned
    if (!userWithCommission.commission) {
      return res.status(400).json({ message: "This user does not have a commission profile assigned." });
    }
 
    const commissionId = userWithCommission.commission._id;
 
    // Fetch ONLY "Edit" action activities related to the commission ID
    const recentActivities = await ActivityLog.find({
      operationId: commissionId,
      action: "Edit", // Strictly filter only "Edit" actions
    })
      .sort({ timestamp: -1 }) // Sort by most recent first
      .limit(10); // Get the last 10 activities
 
    const formattedRecentActivities = recentActivities.map((activity) => ({
      activityId: activity._id,
      action: activity.action,
      timestamp: activity.timestamp,
      details: activity.activity,
      screen: activity.screen,
    }));
 
    return res.status(200).json({
      message: "Commission profile retrieved successfully.",
      commissionProfile: userWithCommission.commission,
      recentActivities: formattedRecentActivities, // Now contains only "Edit" activities
    });
 
  } catch (error) {
    console.error("Error fetching commission profile:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};