const Leads = require("../database/model/leads")
const Region = require('../database/model/region')
const Area = require('../database/model/area')
const RenewalLicenser = require('../database/model/renewLicenser')
const mongoose = require('mongoose');
const Bda = require('../database/model/bda')
const User = require("../database/model/user");
const moment = require("moment");
const Lead = require("../database/model/leads");
const filterByRole = require("../services/filterByRole");
const axios = require('axios');
const AreaManager = require("../database/model/areaManager");
const RegionManager = require("../database/model/regionManager");
const jwt = require("jsonwebtoken");

const Ticket = require("../database/model/ticket");
const SupportAgent = require("../database/model/supportAgent");
const ActivityLogg = require("../database/model/activityLog");
 
const dataExist = async (regionId, areaId, bdaId) => {
  const [regionExists, areaExists, bdaExists] = await Promise.all([
    Region.find({ _id: regionId }, { _id: 1, regionName: 1 }),
    Area.find({ _id: areaId }, { _id: 1, areaName: 1 }),
    Bda.find({ _id: bdaId }, { _id: 1, user: 1 }),
  ]);
 
  let bdaName = null;
  if (bdaExists && bdaExists.length > 0) {
    const bdaUser = await User.findOne({ _id: bdaExists[0].user }, { userName: 1 });
    if (bdaUser) {
      bdaName = bdaUser.userName;
    }
  }
 
  return {
    regionExists,
    areaExists,
    bdaExists,
    bdaName,
  };
};
 
 
 
 
exports.addLicenser = async (req, res, next) => {
  try {
    const { id: userId, userName } = req.user;
    const cleanedData = cleanLicenserData(req.body);
    const { firstName, email, phone, regionId, areaId, bdaId } = cleanedData;

    // Check for duplicate user details
    const duplicateCheck = await checkDuplicateUser(firstName, email, phone);
    if (duplicateCheck) {
      return res.status(400).json({ message: `Conflict: ${duplicateCheck}` });
    }

    const { regionExists, areaExists, bdaExists } = await dataExist(regionId, areaId, bdaId);
    if (!validateRegionAndArea(regionExists, areaExists, bdaExists, res)) return;
    if (!validateInputs(cleanedData, regionExists, areaExists, bdaExists, res)) return;
    const [regionManager, areaManager] = await Promise.all([
      RegionManager.findOne({ region: regionId }),
      AreaManager.findOne({ area: areaId })
    ]);
// Check if regionManager is null
if (!regionManager) {
  return res.status(400).json({ message: "Selected region has no Region Manager" });
}

// Check if areaManager is null
if (!areaManager) {
  return res.status(400).json({ message: "Selected area has no Area Manager" });
}


      cleanedData.regionManager = regionManager._id
      cleanedData.areaManager = areaManager._id
    
    // Body for the POST request
    const requestBody = {
      organizationName: cleanedData.companyName,
      contactName: firstName,
      contactNum: phone,
      email: email,
      password: cleanedData.password,
    };

    
    // Generate JWT token
        const token = jwt.sign(
          {
            organizationId: process.env.ORGANIZATION_ID,
          },
          process.env.NEX_JWT_SECRET,
          { expiresIn: "12h" }
        );
    // Send POST request to external API
    const response = await axios.post(
      'https://billbizzapi.azure-api.net/sit.organization/create-billbizz-client',
      requestBody, // <-- requestBody should be passed as the second argument (data)
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

 

    const organizationId = response.data.organizationId;
    const savedLicenser = await createLicenser(cleanedData, regionId, areaId, bdaId, userId, userName, organizationId);

    const licenserId = savedLicenser._id;
    
    // Send combined response
    res.status(201).json({
      message: "Licenser added successfully",
      licenserId,
      externalApiResponse: response.data, // Include external API response
    });

    // Log activity
    ActivityLog(req, "successfully", licenserId);
    next();

  } catch (error) {
    console.error("Error adding licenser:", error.response?.data?.message || "Unknown error");

    // If the error is from Axios, capture the response
    if (error.response) {
      return res.status(error.response.status).json({
        message: "External API error",
        details: error.response.data,
      });
    }

    res.status(500).json({ message: "Internal server error" });
    ActivityLog(req, "Failed");
    next();
  }
};

 
 
exports.getLicenser = async (req, res) => {
  try {
    const { licenserId } = req.params;
 
    const licenser = await Leads.findById(licenserId);
    if (!licenser) {
      return res.status(404).json({ message: "Licenser not found" });
    }
 
    const { regionId, areaId, bdaId } = licenser;
    const { regionExists, areaExists, bdaExists, bdaName } = await dataExist(regionId, areaId, bdaId);
 
    const enrichedLicenser = {
      ...licenser.toObject(),
      regionDetails: regionExists[0] || null,
      areaDetails: areaExists[0] || null,
      bdaDetails: {
        bdaId: bdaExists[0]?._id || null,
        bdaName: bdaName || null,
      },
    };
 
    res.status(200).json(enrichedLicenser);
  } catch (error) {
    console.error("Error fetching licenser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
 
 
exports.getAllLicensers = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = await filterByRole(userId);

    // Add customerStatus filter
    query.customerStatus = "Licenser";

    // Fetch Licensors
    const licensers = await Leads.find(query)
      .populate({ path: "regionId", select: "_id regionName" })
      .populate({ path: "areaId", select: "_id areaName" })
      .populate({
        path: "bdaId",
        select: "_id user",
        populate: { path: "user", select: "userName" },
      });

    if (!licensers.length) return res.status(404).json({ message: "No Licensors found." });

    const currentDate = moment().format("YYYY-MM-DD");

    // Iterate through licensors and update licensorStatus based on the date conditions
    for (const licensor of licensers) {
      const { startDate, endDate } = licensor;

      if (moment(currentDate).isBetween(startDate, endDate, undefined, "[]")) {
        const remainingDays = moment(endDate).diff(currentDate, "days");

        if (remainingDays <= 7) {
          // If 7 or fewer days remaining, set status to Pending Renewal
          licensor.licensorStatus = "Pending Renewal";
        } else {
          // Otherwise, set status to Active
          licensor.licensorStatus = "Active";
        }
      } else {
        // If the current date is outside the start and end dates, set status to Expired
        licensor.licensorStatus = "Expired";
      }

      // Save the updated licensor status
      await licensor.save();
    }

    // Return updated licensors
    res.status(200).json({ licensers });
  } catch (error) {
    console.error("Error fetching Licensors:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// exports.getAllLicensers = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const query = await filterByRole(userId);

//     // Add customerStatus filter
//     query.customerStatus = "Licenser";

//     // Fetch Licensers
//     const licensers = await Leads.find(query)
//       .populate({ path: "regionId", select: "_id regionName" })
//       .populate({ path: "areaId", select: "_id areaName" })
//       .populate({
//         path: "bdaId",
//         select: "_id user",
//         populate: { path: "user", select: "userName" },
//       });

//     if (!licensers.length) return res.status(404).json({ message: "No Licensers found." });

//     // Return response
//     res.status(200).json({ licensers });
//   } catch (error) {
//     console.error("Error fetching Licensers:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };

 
exports.editLicenser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = cleanLicenserData(req.body);
 
    // Fetch the existing document to get the user field
const existingLicenser = await Leads.findById(id);
if (!existingLicenser) {
  return res.status(404).json({ message: "licenser  not found" });
}
 
 
    // Check for duplicate user details, excluding the current document
    const duplicateCheck = await checkDuplicateUser(data.firstName, data.email, data.phone, id);
    if (duplicateCheck) {
      return res.status(400).json({ message: `Conflict: ${duplicateCheck}` });
    }
 
   
    Object.assign(existingLicenser, data);
    const updatedLicenser = await existingLicenser.save();
 
    if (!updatedLicenser) {
      return res.status(404).json({ message: "licenser not found" });
    }
 
    res.status(200).json({
      message: "Licenser updated successfully"
    });
    ActivityLog(req, "Successfully", updatedLicenser._id);
    next()
  } catch (error) {
    console.error("Error editing licenser:", error);
    res.status(500).json({ message: "Internal server error" });
    ActivityLog(req, "Failed");
   next();
  }
};
 

exports.renewLicenser = async (req, res , next) => {
  try {
    const { licenserId, newEndDate } = req.body;
 
    // Step 1: Find the licenser in the Leads collection
    const licenser = await Lead.findById(licenserId);
    if (!licenser) {
      return res.status(404).json({ message: "Licenser not found" });
    }
 
    // Step 2: Count previous renewals for this licenser
    const renewalCount = await RenewalLicenser.countDocuments({ licenser: licenserId });
 
    // Step 3: Update startDate, endDate, and licenserStatus in Leads collection
    const renewalDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
    licenser.startDate = renewalDate; // Set renewal date as new start date
    licenser.endDate = newEndDate; 
    licenser.renewalDate = renewalDate; 
    // licenser.licensorStatus = "Active"; // Set licenser status to Active
 
    await licenser.save();
 
    // Step 4: Create a new renewal record in RenewalLicenser collection
    const newRenewal = new RenewalLicenser({
      renewalDate: renewalDate, // Store the renewal date
      licenser: licenserId,
      renewalCount: renewalCount + 1 // First time = 1, then increment
    });
 
    await newRenewal.save();
 
    res.status(200).json({
      message: "Licenser renewed successfully",
      
    });
    ActivityLog(req, "successfully", newRenewal._id);
    next();
 
  } catch (error) {
    console.error("Renewal error:", error);
    res.status(500).json({ message: "Internal server error" });
    ActivityLog(req, "Failed");
    next();
  }
};
 
 
 
 
 
// async function createLicenser(cleanedData, regionId, areaId, bdaId, userId, userName , organizationId) {
//   const { ...rest } = cleanedData;
 
//   // Generate the next licenser ID
//   let nextId = 1;
 
//   // Fetch the last licenser based on the numeric part of customerId
//   const lastLicenser = await Leads.findOne().sort({ customerId: -1 }); // Sort by customerId in descending order
 
//   if (lastLicenser) {
//     const lastId = parseInt(lastLicenser.customerId.split("-")[1]); // Extract numeric part
//     nextId = lastId + 1; // Increment the last ID
//   }
 
//   // Format the new licenser ID
//   const customerId = `CSTMID-${nextId.toString().padStart(4, "0")}`;
 
//   // Save the new licenser
//   const savedLicenser = await createNewLicenser(
//     { ...rest, customerId },
//     regionId,
//     areaId,
//     bdaId,
//     true,
//     userId,
//     userName,
//     organizationId
//   );
 
//   return savedLicenser;
// }
 


async function createLicenser(cleanedData, regionId, areaId, bdaId, userId, userName, organizationId) {
  const { ...rest } = cleanedData;
  
  // Generate the next licenser ID
  let nextId = 1;
  
  // Fetch the last licenser based on the numeric part of customerId
  const lastLicenser = await Leads.findOne().sort({ customerId: -1 }); // Sort by customerId in descending order
  
  if (lastLicenser) {
    const lastId = parseInt(lastLicenser.customerId.split("-")[1]); // Extract numeric part
    nextId = lastId + 1; // Increment the last ID
  }
  
  // Format the new licenser ID
  const customerId = `CSTMID-${nextId.toString().padStart(4, "0")}`;
  
  // Get the current date and time
  const licensorDate = moment().format("YYYY-MM-DD HH:mm:ss"); // Example format: 2024-02-07 14:30:00
  
  // Save the new licenser
  const savedLicenser = await createNewLicenser(
    { ...rest, customerId, licensorDate },
    regionId,
    areaId,
    bdaId,
    true,
    userId,
    userName,
    organizationId
  );
  
  return savedLicenser;
}

 
 
 
const ActivityLog = (req, status, operationId = null) => {
  const { id, userName } = req.user;
  const log = { id, userName, status };
 
  if (operationId) {
    log.operationId = operationId;
  }
 
  req.user = log;
};
 
 
 
 
  // Validate Organization Tax Currency
  function validateRegionAndArea( regionExists, areaExists, bdaExists ,res ) {
    if (!regionExists) {
      res.status(404).json({ message: "Region not found" });
      return false;
    }
    if (!areaExists) {
      res.status(404).json({ message: "Area not found." });
      return false;
    }
    if (!bdaExists) {
      res.status(404).json({ message: "BDA not found." });
      return false;
    }
    return true;
  }
 
 
 
  const checkDuplicateUser = async (firstName, email, phone, excludeId) => {
    const existingUser = await Lead.findOne({
      $and: [
        { _id: { $ne: excludeId } }, // Exclude the current document
        {
          $or: [
            { firstName },
            { email },
            { phone },
          ],
        },
      ],
    });
 
 
 
    if (!existingUser) return null;
 
    const duplicateMessages = [];
    if (existingUser.firstName === firstName)
      duplicateMessages.push("Full name already exists");
    if (existingUser.email === email)
      duplicateMessages.push("Login email already exists");
    if (existingUser.phone === phone)
      duplicateMessages.push("Phone number already exists");
 
    return duplicateMessages.join(". ");
  };
 
 
 
   //Clean Data
   function cleanLicenserData(data) {
    const cleanData = (value) => (value === null || value === undefined || value === "" ? undefined : value);
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = cleanData(data[key]);
      return acc;
    }, {});
  }
 
 
 
  // Create New Debit Note
  function createNewLicenser(data, regionId, areaId, bdaId, newLicenser, userId, userName) {
    const newLicensers = new Leads({ ...data, regionId, areaId, bdaId, newLicenser, userId, userName, customerStatus:"Licenser", licensorStatus:"Active" });
    return newLicensers.save();
  }
 
 
 
   //Validate inputs
   function validateInputs( data, regionExists, areaExists, bdaExists, res) {
    const validationErrors = validateLicenserData(data, regionExists, areaExists, bdaExists );  
 
    if (validationErrors.length > 0) {
      res.status(400).json({ message: validationErrors.join(", ") });
      return false;
    }
    return true;
  }
 
 
 
  //Validate Data
  function validateLicenserData( data  ) {
    const errors = [];
 
    //Basic Info
    validateReqFields( data, errors );
    validateSalutation(data.salutation, errors);
    validateLicenserStatus(data.licensorStatus, errors);
 
 
    return errors;
  }
 
 
 
  // Field validation utility
  function validateField(condition, errorMsg, errors) {
    if (condition) errors.push(errorMsg);
  }
 
  //Validate Salutation
  function validateSalutation(salutation, errors) {
    validateField(salutation && !validSalutations.includes(salutation),
      "Invalid Salutation: " + salutation, errors);
  }
 
  //Validate Salutation
  function validateLicenserStatus(licensorStatus, errors) {
    validateField(licensorStatus && !validLicenserStatus.includes(licensorStatus),
      "Invalid leadStatus: " + licensorStatus, errors);
  }
 
 
  //Valid Req Fields
  function validateReqFields( data, errors ) {
 
  validateField( typeof data.regionId === 'undefined' , "Please select a Region", errors  );
  validateField( typeof data.areaId === 'undefined','undefined', "Please select a Area", errors  );
  validateField( typeof data.bdaId === 'undefined', "Please select a BDA", errors  );
  validateField( typeof data.firstName === 'undefined', "Firstname required", errors  );
  validateField( typeof data.email === 'undefined', "email required", errors  );
  validateField( typeof data.phone === 'undefined', "Phone number required", errors  );
  validateField( typeof data.startDate === 'undefined', "Start Date required", errors  );
  validateField( typeof data.endDate === 'undefined', "End Date required", errors  );
 
  }
 
 
 
  const validSalutations = ["Mr.", "Mrs.", "Ms.", "Miss.", "Dr."];
  const validLicenserStatus = ["New", "Contacted", "Inprogress", "Lost", "Won"];
 
 


exports.getLicenserDetails = async (req, res) => {
  try {
    const { id } = req.params; // id is the Licenser ID
    
    // Step 1: Fetch startDate and endDate from Leads collection for the given Licenser ID
    const licenser = await Leads.findById(id).select("startDate endDate");
    if (!licenser) {
      return res.status(404).json({ message: "Licenser not found" });
    }
    const { startDate, endDate } = licenser;

    // Step 2: Fetch open tickets (status != "Resolved") from the Ticket collection
    const openTicketsCount = await Ticket.countDocuments({
      customerId: id,
      status: { $ne: "Resolved" },
    });

    // Step 3: Fetch closed tickets (status == "Resolved") from the Ticket collection
    const closedTicketsCount = await Ticket.countDocuments({
      customerId: id,
      status: "Resolved",
    });

    // Step 4: Fetch support tickets for the given Licenser ID
    const supportTickets = await Ticket.find({ customerId: id })
      .select("ticketId priority status openingDate supportAgentId")
      .populate({
        path: "supportAgentId",
        select: "user",
        populate: {
          path: "user",
          select: "userName",
        },
      });

    // Format the supportTickets response
    const formattedSupportTickets = supportTickets.map((ticket) => ({
      _id:ticket._id,
      ticketId: ticket.ticketId,
      priority: ticket.priority,
      status: ticket.status,
      openingDate: ticket.openingDate,
      supportAgent: ticket.supportAgentId?.user?.userName || "N/A",
    }));

    // Step 5: Fetch recent activities for the given Licenser ID (operationId)
    const recentActivities = await ActivityLogg.find({ operationId: id })
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .limit(10); // Limit the result to a maximum of 10 documents

    const formattedRecentActivities = recentActivities.map((activity) => ({
      activityId: activity._id,
      action: activity.action,
      timestamp: activity.timestamp,
      details: activity.activity,
      screen:activity.screen
    }));

    // Step 6: Send the response with all the gathered details
    res.status(200).json({
      licenserDetails: {
        startDate,
        endDate,
        openTickets: openTicketsCount,
        closedTickets: closedTicketsCount,
        supportTickets: formattedSupportTickets,
        recentActivities: formattedRecentActivities,
      },
    });
  } catch (error) {
    console.error("Error fetching Licenser details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
