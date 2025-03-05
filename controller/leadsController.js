const Leads = require("../database/model/leads")
const Region = require('../database/model/region')
const Area = require('../database/model/area')
const mongoose = require('mongoose');
const User = require("../database/model/user");
const axios = require('axios');
const nodemailer = require('nodemailer');
const moment = require("moment"); 
const Ticket = require("../database/model/ticket");
const AreaManager = require("../database/model/areaManager");
const RegionManager = require("../database/model/regionManager");
const Bda = require('../database/model/bda')
const filterByRole = require("../services/filterByRole");
const jwt = require("jsonwebtoken");
const Activity = require("../database/model/activity")




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



exports.addLead = async (req, res , next ) => {
  try {
    const { id: userId, userName } = req.user;
   
   
    const cleanedData = cleanLeadData(req.body);
   
    const { firstName, email, phone, regionId, areaId , bdaId } = cleanedData;
 
   console.log(cleanedData.email);
   
 
   // Check for duplicate user details
   const duplicateCheck = await checkDuplicateUser(firstName,email, phone);
   if (duplicateCheck) {
     return res.status(400).json({ message: `Conflict: ${duplicateCheck}` }); // Return a success response with conflict details
   }
 
 
    const { regionExists, areaExists , bdaExists } = await dataExist( regionId, areaId , bdaId);
 
    if (!validateRegionAndArea( regionExists, areaExists, bdaExists ,res )) return;
 
    if (!validateInputs( cleanedData, regionExists, areaExists, bdaExists ,res)) return;
 
 
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
    
 
   
    // const savedLeads = await createNewLeads(cleanedData, regionId, areaId, bdaId , userId, userName );
 
 
    // Create the new lead data with ObjectId references for regionManager and areaManager
    const newLeadData = {
      ...cleanedData,
      regionManager: regionManager._id, // Store the userName of the regionManager
      areaManager: areaManager._id,
      regionId,
      areaId,
    };
   
 
    // Save the new lead
    const savedLeads = await createLead(newLeadData, regionId, areaId, bdaId, userId, userName);
 
      // Pass operation details to middleware
  
      
    res.status(201).json({ message: "Lead added successfully", savedLeads });
    ActivityLog(req, "successfully", savedLeads._id);
      next();

 
  } catch (error) {
    console.error("Error adding lead:", error);
    res.status(500).json({ message: "Internal server error" });
    ActivityLog(req, "Failed");
    next();
  }
};



exports.getLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Fetch the lead by ID
    const lead = await Leads.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Extract the related entity IDs from the lead
    const { regionId, areaId, bdaId } = lead;

    // Fetch related entity details using dataExist
    const { regionExists, areaExists, bdaExists, bdaName } = await dataExist(regionId, areaId, bdaId);

    // Enrich the response with related data
    const enrichedLead = {
      ...lead.toObject(),
      regionDetails: regionExists[0] || null, // Assuming regionExists is an array
      areaDetails: areaExists[0] || null,    // Assuming areaExists is an array
      bdaDetails: {
        bdaId: bdaExists[0]?._id || null,
        bdaName: bdaName || null,
      },
    };

    // Send the enriched lead data as the response
    res.status(200).json(enrichedLead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




exports.getAllLeads = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = await filterByRole(userId);
    
    // Add customerStatus filter
    query.customerStatus = "Lead";

    // Fetch Licensers
    const leads = await Leads.find(query)
      .populate({ path: "regionId", select: "_id regionName" })
      .populate({ path: "areaId", select: "_id areaName" })
      .populate({
        path: "bdaId",
        select: "_id user",
        populate: { path: "user", select: "userName" },
      });

    if (!leads.length) return res.status(404).json({ message: "No Leads found." });

    // Return response
    res.status(200).json({ leads });
  } catch (error) {
    console.error("Error fetching Leads:", error.message);
    res.status(500).json({ message: error.message });
  }
};


exports.editLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = cleanLeadData(req.body);
    const { regionId, areaId , bdaId } = data;
 
    // Fetch the existing document to get the user field
const existingLead = await Leads.findById(id);
if (!existingLead) {
  return res.status(404).json({ message: "Lead  not found" });
}
 
 
    // Check for duplicate user details, excluding the current document
    const duplicateCheck = await checkDuplicateUser(data.firstName, data.email, data.phone, id);
    if (duplicateCheck) {
      return res.status(400).json({ message: `Conflict: ${duplicateCheck}` });
    }
 
    const { regionExists, areaExists , bdaExists } = await dataExist( regionId, areaId , bdaId);
 
    if (!validateRegionAndArea( regionExists, areaExists, bdaExists ,res )) return;
 
    if (!validateInputs( data, regionExists, areaExists, bdaExists ,res)) return;
 
   
    Object.assign(existingLead, data);
    const updatedLead = await existingLead.save();
 
    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }
 
  // Determine the response message based on customerStatus
  const responseMessage = existingLead.customerStatus === 'Trial'
  ? "Trial updated successfully"
  : "Lead updated successfully";
 
  res.status(200).json({
    message: responseMessage,
  });
 
 
    ActivityLog(req, "Successfully", updatedLead._id);
    next()
  } catch (error) {
    console.error("Error editing Lead:", error);
    res.status(500).json({ message: "Internal server error" });
    ActivityLog(req, "Failed");
   next();
  }
};





exports.deleteLead = async (req, res, next) => {
  try {
    const { leadId } = req.params;
 
    // Validate if leadId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ message: "Invalid lead ID." });
    }
 
    // Check if the lead exists
    const lead = await Leads.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }
 
    // Check if leadStatus is "New", only then allow deletion
    if (lead.leadStatus !== "New") {
      return res.status(400).json({
        message: "Cannot delete lead because it is not in 'New' status.",
      });
    }
 
    // Check if the lead has customerStatus "Lead"
    if (lead.customerStatus !== "Lead") {
      return res.status(400).json({
        message: "Cannot delete lead because the customer status is not 'Lead'.",
      });
    }
 
    // Check if the leadId is referenced in the Activity collection
    const activity = await Activity.findOne({ leadId:leadId });
    if (activity) {
      return res.status(400).json({
        message: "Cannot delete lead because it is referenced in Activity collection.",
      });
    }
 
 
 
    // Delete the lead
    const deletedLead = await Leads.findByIdAndDelete(leadId);
 
    res.status(200).json({ message: "Lead deleted successfully." });
    ActivityLog(req, "Successfully", deletedLead._id);
    next();
  } catch (error) {
    console.error("Error deleting lead:", error.message || error);
    res.status(500).json({ message: "Internal server error." });
    ActivityLog(req, "Failed");
    next();
  }
};

exports.convertLeadToTrial = async (req, res, next) => {
  try {

    const { leadId } = req.params; // Get the lead ID from request parameters
    const { organizationName,customerStatus, contactName, contactNum, email, password ,startDate,endDate} = req.body;
    const trialDate = moment().format('YYYY-MM-DD');


    // Validate request body
    if (!organizationName || !contactName || !contactNum || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Configure the request with timeout
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 seconds timeout
    };

    // Body for the POST request
    const requestBody = {
      organizationName,
      contactName,
      contactNum,
      email,
      password,
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
    console.log("response",organizationId)


        
        // Find the lead by ID and update its customerStatus to "Trial" and set the customerId
        const updatedLead = await Leads.findByIdAndUpdate(
          leadId,
          {
            customerStatus: customerStatus,
            trialStatus: "In Progress",
            startDate, // Save formatted date
            endDate,    // Save formatted date
            organizationId,
            organizationName,
            email,
            trialDate
          },
          { new: true } // Return the updated document
        );
    
        // Check if the lead was found and updated
        if (!updatedLead) {
          return res.status(404).json({ message: "Lead not found or unable to convert." });
        }
  


    res.status(200).json({ message: "Lead converted to Trial successfully.", lead: updatedLead });
    ActivityLog(req, "Successfully", updatedLead._id);
    next()  

  } catch (error) {
    console.error("Error during client creation:", error.message || error);

    // Handle specific error cases
    if (error.response) {
      // API responded with an error
      return res.status(error.response.status).json({
        message: `Client creation failed with status code: ${error.response.status}`,
        error: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response was received
      return res.status(504).json({ message: "No response from client creation service" });
    } else {
      // Other unexpected errors
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};


exports.getAllTrials = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = await filterByRole(userId);

    // Add customerStatus filter
    query.customerStatus = "Trial";

    // Fetch Licensers
    const trial = await Leads.find(query)
      .populate({ path: "regionId", select: "_id regionName" })
      .populate({ path: "areaId", select: "_id areaName" })
      .populate({
        path: "bdaId",
        select: "_id user",
        populate: { path: "user", select: "userName" },
      });

    if (!trial.length) return res.status(404).json({ message: "No Trial found." });

    const currentDate = moment().format("YYYY-MM-DD");

    // Iterate through trials and update trialStatus based on the date conditions
    for (const trials of trial) {
      const { startDate, endDate, trialStatus } = trials;

      if (trialStatus === "Extended") {
        if (moment(currentDate).isBetween(startDate, endDate, undefined, "[]")) {
          // Keep the status as "Extended"
        } else {
          // Update to "Expired" if out of date range
          trials.trialStatus = "Expired";
          await trials.save();
        }
      } else {
        if (moment(currentDate).isBetween(startDate, endDate, undefined, "[]")) {
          trials.trialStatus = "In Progress";
        } else {
          trials.trialStatus = "Expired";
        }
        await trials.save();
      }
    }

    // Return updated trials
    res.status(200).json({ trial });
  } catch (error) {
    console.error("Error fetching Licensers:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getClientDetails = async (req, res) => {
  try {
    // Extract ID from request params
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required in the request parameters." });
    }

      // Generate JWT token
            const token = jwt.sign(
              {
                organizationId: process.env.ORGANIZATION_ID,
              },
              process.env.NEX_JWT_SECRET,
              { expiresIn: "12h" }
            );

    const response = await axios.get(
          `https://billbizzapi.azure-api.net/sit.organization/get-one-organization-nex/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

    
    // Check response and handle errors
    if (response.status !== 200) {
      return res.status(response.status).json({ message: response.statusText });
    }

    // Respond with the data from the external API
    res.status(200).json(response.data);

  } catch (error) {
    console.error("Error fetching client details:", error.message);
    // Handle Axios error (e.g., 404 or network error)
    if (error.response) {
      return res
        .status(error.response.status)
        .json({ message: error.response.data || "Error from external API." });
    }
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.convertTrialToLicenser = async (req, res,next) => {
  try {
    const { trialId } = req.params; // Assume the request contains the ID of the trial to convert.
    const { startDate, endDate } = req.body;

    // Get the current date in "YYYY-MM-DD" format
    const licensorDate = moment().format('YYYY-MM-DD');

    // Find the trial by ID and update its customerStatus to "Licenser"
    const updatedTrial = await Leads.findByIdAndUpdate(
      trialId,
      {
        customerStatus: "Licenser",
        licensorStatus: "Active",
        startDate,
        endDate,
        licensorDate,
      },
      { new: true } // Return the updated document
    );

    // Check if the trial was found and updated
    if (!updatedTrial) {
      return res.status(404).json({ message: "Trial not found or unable to convert." });
    }

    res.status(200).json({ message: "Trial converted to Licenser successfully.", trial: updatedTrial });
    ActivityLog(req, "Successfully", updatedTrial._id);
    next();
  } catch (error) {
    console.error("Error converting Trial to Licenser:", error);
    res.status(500).json({ message: "Internal server error." });
    ActivityLog(req, "Failed");
    next();
  }
};



async function createLead(cleanedData, regionId, areaId, bdaId, userId, userName) {
  // Extract other fields from the cleanedData
  const { ...rest } = cleanedData;

  // Generate the next lead ID
  let nextId = 1;

  // Try to get the last lead to determine the next ID
  const lastLead = await Leads.findOne().sort({ customerId: -1 }); // Sort by leadId descending

  if (lastLead) {
    const lastId = parseInt(lastLead.customerId.split("-")[1]); // Extract numeric part
    nextId = lastId + 1; // Increment the last ID

  }

  // Format the new lead ID
  const customerId = `CSTMID-${nextId.toString().padStart(4, "0")}`;

  // Create and save the new lead
  const savedLeads = await createNewLeads(
    { ...rest, customerId }, // Pass lead data with the generated leadId
    regionId,
    areaId,
    bdaId,
    true, // Mark as a new lead
    userId,
    userName,
    
  );

  return savedLeads; // Return the saved lead
}


// // Function to auto-generate the customerId
// async function generateCustomerId() {
//   let nextId = 1;

//   // Try to get the last lead to determine the next customer ID
//   const lastLead = await Leads.findOne().sort({ _id: -1 }); // Sort by customerId descending

//   if (lastLead) {
//     const lastId = parseInt(lastLead.customerId.slice(6));// Extract numeric part
//     nextId = lastId + 1; // Increment the last ID
//   }

//   // Format the new customer ID
//   const customerId = `CUSTID-${nextId.toString().padStart(4, "0")}`;

//   return customerId;
// }



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
    // Build the dynamic query condition
    const conditions = [];
    if (firstName) conditions.push({ firstName });
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });
  
    if (conditions.length === 0) return null; // No fields to check
  
    // Query to find existing user excluding the given ID
    const existingUser = await Leads.findOne({
      _id: { $ne: excludeId },
      $or: conditions,
    });
  
    if (!existingUser) return null;
  
    // Build the duplicate messages based on matching fields
    const duplicateMessages = [];
    if (firstName && existingUser.firstName === firstName)
      duplicateMessages.push("First name already exists");
    if (email && existingUser.email === email)
      duplicateMessages.push("Email already exists");
    if (phone && existingUser.phone === phone)
      duplicateMessages.push("Phone number already exists");
  
    return duplicateMessages.join(". ");
  };
  

  // const checkDuplicateUser = async (firstName, email, phone, excludeId) => {
  //   const existingUser = await Leads.findOne({
  //     $and: [
  //       { _id: { $ne: excludeId } }, // Exclude the current document
  //       {
  //         $or: [
  //           { firstName },
  //           { email },
  //           { phone },
  //         ],
  //       },
  //     ],
  //   });
  
  //   if (!existingUser) return null;
  
  //   const duplicateMessages = [];
  //   if (existingUser.firstName === firstName)
  //     duplicateMessages.push("First already exists");
  //   if (existingUser.email === email)
  //     duplicateMessages.push(" Email already exists");
  //   if (existingUser.phone === phone)
  //     duplicateMessages.push("Phone number already exists");
  
  //   return duplicateMessages.join(". ");
  // };


   //Clean Data 
   function cleanLeadData(data) {
    const cleanData = (value) => (value === null || value === undefined || value === "" || value === 0 ? undefined : value);
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = cleanData(data[key]);
      return acc;
    }, {});
  }
  


  // Create New Debit Note
  function createNewLeads( data, regionId, areaId, bdaId,  userId, userName ) {
    const newLeads = new Leads({ ...data, regionId, areaId, bdaId, userId, userName , leadStatus: "New", customerStatus: "Lead" 

    });
    return newLeads.save();
  }



   //Validate inputs
function validateInputs( data, res) {
  const validationErrors = validateLeadsData(data );  

  if (validationErrors.length > 0) {
    res.status(400).json({ message: validationErrors.join(", ") });
    return false;
  }
  return true;
}



//Validate Data
function validateLeadsData( data ) {
  const errors = [];

  //Basic Info
  validateReqFields( data, errors );
  validateSalutation(data.salutation, errors);
  validateLeadStatus(data.leadStatus, errors);


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
function validateLeadStatus(leadStatus, errors) {
  validateField(leadStatus && !validLeadStatus.includes(leadStatus),
    "Invalid leadStatus: " + leadStatus, errors);
}

//Valid Req Fields
function validateReqFields( data, errors ) {

validateField( typeof data.regionId === 'undefined' ,"Please select a Region", errors  );
validateField( typeof data.areaId === 'undefined' , "Please select a Area", errors  );
validateField( typeof data.bdaId === 'undefined' , "Please select a BDA", errors  );
validateField( typeof data.firstName === 'undefined', "Firstname required", errors  );
validateField( typeof data.phone === 'undefined', "Phone number required", errors  );

}



const validSalutations = ["Mr.", "Mrs.", "Ms.", "Miss.", "Dr."];
const validLeadStatus = ["New", "Contacted", "Inprogress", "Lost", "Won"];






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


// Function to send OTP email asynchronously
// const sendClientCredentialsEmail = async (email, organizationName, contactName, password, startDate, endDate) => {
//   const mailOptions = {
//     from: `"BillBizz Team" <${process.env.EMAIL}>`,
//     to: email,
//     subject: 'Welcome to BillBizz ERP Solution - Trial Account',
//     text: `Dear ${contactName},

// Welcome to BillBizz! We are thrilled to have ${organizationName} onboard as a trial user.

// Here are your trial account details to get started:

// - Login Email: ${email}
// - Password: ${password}
// - Trial Period: ${startDate} to ${endDate}
// - Web Portal Link: https://dev.billbizz.cloud/login

// Please log in using the credentials above to explore the features of BillBizz ERP Solution. If you have any questions during your trial, feel free to reach out to our support team.

// Thank you for choosing BillBizz. We hope you enjoy your trial experience.

// Best regards,  
// The BillBizz Team`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Client credentials email sent successfully');
//     return true;
//   } catch (error) {
//     console.error('Error sending client credentials email:', error);
//     return false;
//   }
// };


const sendClientCredentialsEmail = async (email, organizationName, contactName, password, startDate, endDate, isTrial) => {
  const subject = isTrial
    ? 'Welcome to BillBizz ERP Solution - Trial Account'
    : 'Welcome to BillBizz ERP Solution - Licensed Account';

  const accountType = isTrial ? 'trial' : 'licensed';
  const periodType = isTrial ? 'Trial Period' : 'License Validity';

  const text = `Dear ${contactName},

Welcome to BillBizz! We are thrilled to have ${organizationName} onboard as a ${accountType} user.

Here are your ${accountType} account details to get started:

- Login Email: ${email}
- Password: ${password}
- ${periodType}: ${startDate} to ${endDate}
- Web Portal Link: https://dev.billbizz.cloud/login

Please log in using the credentials above to ${
    isTrial
      ? 'explore the features of BillBizz ERP Solution during your trial period'
      : 'fully leverage the capabilities of BillBizz ERP Solution'
  }. If you need any assistance, feel free to reach out to our support team.

Thank you for choosing BillBizz. We ${
    isTrial ? 'hope you enjoy your trial experience' : 'look forward to supporting your business success'
  }.

Best regards,  
The BillBizz Team`;

  const mailOptions = {
    from: `"BillBizz Team" <${process.env.EMAIL}>`,
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`${isTrial ? 'Trial' : 'Licensed'} user email sent successfully`);
    return true;
  } catch (error) {
    console.error(`Error sending ${isTrial ? 'trial' : 'licensed'} user email:`, error);
    return false;
  }
};



exports.extendTrialDuration = async (req, res, next) => {
  try {
    const { trialId } = req.params;
    const { duration } = req.body;
 
    // Validate request body
    if (!duration || isNaN(duration)) {
      return res.status(400).json({ message: "Valid duration is required." });
    }
 
    // Find the lead by ID
    const lead = await Leads.findById(trialId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }
 
    // Parse the current endDate from the database
    const currentEndDate = moment(lead.endDate, "YYYY-MM-DD");
    if (!currentEndDate.isValid()) {
      return res.status(400).json({ message: "Invalid end date in the database." });
    }
 
    // Calculate the new endDate
    const newEndDate = currentEndDate.add(parseInt(duration, 10), "days");
 
    // Update the lead's details
    const updatedLead = await Leads.findByIdAndUpdate(
      trialId,
      {
        endDate: newEndDate.format("YYYY-MM-DD"), // Update endDate
        trialStatus: "Extended", // Set status as Extended
        duration, // Save the extension duration
      },
      { new: true } // Return the updated document
    );
 
    if (!updatedLead) {
      return res.status(500).json({ message: "Failed to update trial." });
    }
 
    
    
    // Send the response
    res.status(200).json({ message: "Trial duration extended successfully.", lead: updatedLead, });
 
    ActivityLog(req, "Successfully", updatedLead._id);
    next()
  } catch (error) {
    console.error("Error extending trial duration:", error.message || error);
 
    res.status(500).json({ message: "Internal server error." });
    ActivityLog(req, "Failed");
    next();
  }
};



exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = await filterByRole(userId);
    
    

    // Fetch all leads that match the query
    const leads = await Leads.find(query);

    // Get the current date in the required format
    const currentDate = moment().format("YYYY-MM-DD");

    // Calculate statistics
    const totalLeads = leads.filter(lead => lead.customerStatus === "Lead").length;
    const leadsToday = leads.filter(
      lead => lead.customerStatus === "Lead" && moment(lead.createdAt).format("YYYY-MM-DD") === currentDate
    ).length;
    const convertedLeads = leads.filter(
      lead => lead.customerStatus !== "Lead"
    ).length;
    const leadsLost = leads.filter(
      lead => lead.customerStatus === "Lead" && lead.leadStatus === "Lost"
    ).length;

    const activeTrials = leads.filter(
      lead => lead.customerStatus === "Trial" && lead.trialStatus === "In Progress"
    ).length;
    const extendedTrials = leads.filter(
      lead => lead.customerStatus === "Trial" && lead.trialStatus === "Extended"
    ).length;
    const convertedTrials = leads.filter(
      lead => lead.customerStatus === "Licenser" && lead.trialStatus !== undefined
    ).length;
    const expiredTrials = leads.filter(
      lead => lead.customerStatus === "Trial" && lead.trialStatus === "Expired"
    ).length;

    const totalLicensers = leads.filter(lead => lead.customerStatus === "Licenser").length;
    const licensersToday = leads.filter(
      lead => lead.customerStatus === "Licenser" && moment(lead.licensorDate).format("YYYY-MM-DD") === currentDate
    ).length;
    const activeLicensers = leads.filter(
      lead => lead.customerStatus === "Licenser" && lead.licensorStatus === "Active"
    ).length;
    const expiredLicensers = leads.filter(
      lead => lead.customerStatus === "Licenser" && lead.licensorStatus === "Expired"
    ).length;

    // Return the statistics as a response
    res.status(200).json({
      totalLeads,
      leadsToday,
      convertedLeads,
      leadsLost,
      activeTrials,
      extendedTrials,
      convertedTrials,
      expiredTrials,
      totalLicensers,
      licensersToday,
      activeLicensers,
      expiredLicensers,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error.message);
    res.status(500).json({ message: error.message });
  }
};




 
// API to hold the trial
exports.holdTrial = async (req, res, next) => {
  try {
    const { leadId } = req.params;
 
    // Find the lead and update its trialStatus to "Hold"
    const updatedLead = await Leads.findByIdAndUpdate(
      leadId,
      { trialStatus: "Hold" },
      { new: true }
    );
 
    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found." });
    }
 
    res.status(200).json({ message: "Trial status set to Hold.", lead: updatedLead });
 
    // Log the activity
    ActivityLog(req, "Succesfully", updatedLead._id);
    next();
  } catch (error) {
    console.error("Error updating trial status to Hold:", error.message || error);
    res.status(500).json({ message: "Internal server error." });
    ActivityLog(req, "Failed");
    next();
  }
};
 
// API to resume the trial (change trialStatus back to "In Progress")
exports.resumeTrial = async (req, res, next) => {
  try {
    const { leadId } = req.params;
 
    // Find the lead and update its trialStatus to "In Progress"
    const updatedLead = await Leads.findByIdAndUpdate(
      leadId,
      { trialStatus: "In Progress" },
      { new: true }
    );
 
    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found." });
    }
 
    res.status(200).json({ message: "Trial resumed successfully.", lead: updatedLead });
 
    // Log the activity
    ActivityLog(req, "Successfully", updatedLead._id);
    next();
  } catch (error) {
    console.error("Error resuming trial:", error.message || error);
    res.status(500).json({ message: "Internal server error." });
    ActivityLog(req, "Failed");
    next();
  }
};