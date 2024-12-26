const Leads = require("../database/model/leads")
const Region = require('../database/model/region')
const Area = require('../database/model/area')
const mongoose = require('mongoose');
const Bda = require('../database/model/bda')
const User = require("../database/model/user");
const axios = require('axios');
const nodemailer = require('nodemailer');
const moment = require("moment"); 
const Ticket = require("../database/model/ticket");




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
    
    const { email, regionId, areaId , bdaId } = cleanedData;



    
    // Check if a lead with the same email already exists
    const existingLead = await Leads.findOne({ email });
    if (existingLead) {
      return res.status(400).json({ message: "A lead with this email already exists" });
    }

    const { regionExists, areaExists , bdaExists } = await dataExist( regionId, areaId , bdaId);

    if (!validateRegionAndArea( regionExists, areaExists, bdaExists ,res )) return;

    if (!validateInputs( cleanedData, regionExists, areaExists, bdaExists ,res)) return;
  

    // const newLead = await createLead(cleanedData)
    
    // const savedLeads = await createNewLeads(cleanedData, regionId, areaId, bdaId , userId, userName );

    const savedLeads = await createLead(cleanedData, regionId, areaId, bdaId, userId, userName);


    res.status(201).json({ message: "Lead added successfully", savedLeads });

  // Pass operation details to middleware
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


// Get All Leads without validation
exports.getAllLeads = async (req, res) => {
  try {
    // Fetch all leads from the database
    const leads = await Leads.find({ customerStatus: "Lead" });

    // Check if leads exist
    if (!leads || leads.length === 0) {
      return res.status(404).json({ message: "No leads found." });
    }

    // Enrich data for each lead
    const enrichedLeads = await Promise.all(
      leads.map(async (lead) => {
        const { regionId, areaId, bdaId } = lead;

        // Fetch related details using dataExist
        const { regionExists, areaExists, bdaExists , bdaName} = await dataExist(regionId, areaId, bdaId);

        return {
          ...lead.toObject(),
          regionDetails: regionExists?.[0] || null, // Assuming regionExists is an array
          areaDetails: areaExists?.[0] || null,    // Assuming areaExists is an array
          bdaDetails:{
            bdaId: bdaExists[0]?._id || null,
            bdaName: bdaName || null,
          },    // Assuming bdaExists is an array
        };
      })
    );

    // Respond with the enriched leads data
    res.status(200).json({ leads: enrichedLeads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};



exports.editLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = cleanLeadData(req.body);

    // Fetch the existing document to get the user field
const existingLead = await Leads.findById(id);
if (!existingLead) {
  return res.status(404).json({ message: "Lead  not found" });
}

// Extract the user field (ObjectId)
const existingUserId = existingLead.user;



    // Check for duplicate user details, excluding the current document
    const duplicateCheck = await checkDuplicateUser(data.firstName, data.email, data.phone, existingUserId);
    if (duplicateCheck) {
      return res.status(400).json({ message: `Conflict: ${duplicateCheck}` });
    }

   
    Object.assign(existingLead, data);
    const updatedLead = await existingLead.save();

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({
      message: "Lead updated successfully"
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





// exports.deleteLead = async (req, res, next) => {
//   try {
//     const { leadId } = req.params;

//     // Delete the lead
//     const deletedLead = await Leads.findByIdAndDelete(leadId);

//     if (!deletedLead) {
//       return res.status(404).json({ message: "Lead not found" });
//     }

//     res.status(200).json({ message: "Lead deleted successfully" });

//     // Pass operation details to middleware
//     ActivityLog(req, "successfully");
//     next();
//   } catch (error) {
//     console.error("Error deleting lead:", error);
//     res.status(500).json({ message: "Internal server error" });

//     // Log the failure
//     ActivityLog(req, "Failed");
//     next();
//   }
// };

// exports.convertLeadToTrial = async (req, res) => {
//   try {
//     const { leadId } = req.params; // Get the lead ID from request parameters

//     // Find the lead by ID and update its customerStatus to "Trial" and set the customerId
//     const updatedLead = await Leads.findByIdAndUpdate(
//       leadId,
//       { customerStatus: "Trial" },
//       {new: true } // Return the updated document
//     );

//     // Check if the lead was found and updated
//     if (!updatedLead) {
//       return res.status(404).json({ message: "Lead not found or unable to convert." });
//     }

//     res.status(200).json({ message: "Lead converted to Trial successfully.", lead: updatedLead });
//   } catch (error) {
//     console.error("Error converting lead to Trial:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };



// exports.deleteLead = async (req, res) => {
//   try {
//     const { leadId } = req.params;

//     // Validate if leadId is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(leadId)) {
//       return res.status(400).json({ message: "Invalid lead ID." });
//     }

//     // Check if the lead exists
//     const lead = await Leads.findById(leadId);
//     if (!lead) {
//       return res.status(404).json({ message: "Lead not found." });
//     }

//     // Check if leadId is referenced in other collections (Tickets and Praise)
//     const referenceChecks = await Promise.all([
//       Ticket.exists({ customerId : leadId  }),         // Check if leadId exists in Tickets collection
//     ]);


    
//     // If any of the reference checks are true, block deletion
//     if (referenceChecks.includes(true)) {
//       return res.status(400).json({
//         message: "Cannot delete lead because it is referenced in Tickets collections.",
//       });
//     }
    
//     // Delete the lead
//     await Leads.findByIdAndDelete(leadId);

//     res.status(200).json({ message: "Lead deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting lead:", error.message || error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };



exports.deleteLead = async (req, res) => {
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

    // Check if leadId is referenced in Tickets collection
    const ticket = await Ticket.findOne({ customerId: leadId });
    if (ticket) {
      return res.status(400).json({
        message: "Cannot delete lead because it is referenced in Tickets collection.",
      });
    }

    // Delete the lead
    await Leads.findByIdAndDelete(leadId);

    res.status(200).json({ message: "Lead deleted successfully." });
  } catch (error) {
    console.error("Error deleting lead:", error.message || error);
    res.status(500).json({ message: "Internal server error." });
  }
};




exports.convertLeadToTrial = async (req, res) => {
  try {

    const { leadId } = req.params; // Get the lead ID from request parameters
    const { organizationName, contactName, contactNum, email, password ,startDate,endDate} = req.body;


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

    // Send POST request to external API
    const response = await axios.post(
      'https://dev.billbizz.cloud:5004/create-client',
      requestBody,
      axiosConfig
    );
    const organizationId = response.data.organizationId;
    console.log("response",organizationId)



 // Validate and parse dates in dd-MM-yyyy format
 const StartDate = moment(startDate, "DD-MM-YYYY", true);
 const EndDate = moment(endDate, "DD-MM-YYYY", true);
 const currentDate = moment();


  // Determine trialStatus
let trialStatus = "Expired";  // Default to expired

// Check if the current date is between the startDate and endDate (inclusive)
if (currentDate.isSameOrAfter(StartDate) && currentDate.isSameOrBefore(EndDate)) {
  trialStatus = "In Progress";
} else if (currentDate.isAfter(EndDate)) {
  trialStatus = "Expired";  // explicitly set it to expired if currentDate is past endDate
} else if (currentDate.isBefore(StartDate)) {
  trialStatus = "Not Started";  // for trials that have not started yet
}


    // Find the lead by ID and update its customerStatus to "Trial" and set the customerId
    const updatedLead = await Leads.findByIdAndUpdate(
      leadId,
      { customerStatus: "Trial",
        trialStatus: trialStatus,  // Update trialStatus
        startDate:StartDate.toDate(),
        endDate:EndDate.toDate(),
        organizationId
       },
      {new: true } // Return the updated document
    );

    // Check if the lead was found and updated
    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found or unable to convert." });
    }

    // const emailSent = await sendClientCredentialsEmail(email, organizationName, contactName, password, startDate, endDate, isTrial = true );
    // if (!emailSent) {
    //   return res
    //     .status(500)
    //     .json({ success: false, message: 'Failed to send login credentials email' });
    // }

    // Format dates back to dd-MM-yyyy for the response
    updatedLead.startDate = StartDate.format("DD-MM-YYYY");
    updatedLead.endDate = EndDate.format("DD-MM-YYYY");


    res.status(200).json({ message: "Lead converted to Trial successfully.", lead: updatedLead });
    
    // Successful response
    

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




// exports.getAllTrials = async (req, res) => {
//   try {
//     // Fetch all records with customerStatus as "Trial"
//     const trials = await Leads.find({ customerStatus: "Trial" });

//     // Check if trials exist
//     if (!trials || trials.length === 0) {
//       return res.status(404).json({ message: "No trials found." });
//     }

//     // Respond with the trials
//     res.status(200).json({ trials });
    
//   } catch (error) {
//     console.error("Error fetching trials:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// Get All Trials without validation
exports.getAllTrials = async (req, res) => {
  try {
    // Fetch all trials from the database
    const trials = await Leads.find({ customerStatus: "Trial" });

    // Check if trials exist
    if (!trials || trials.length === 0) {
      return res.status(404).json({ message: "No trials found." });
    }

    // Enrich data for each trial
    const enrichedTrials = await Promise.all(
      trials.map(async (trial) => {
        const { regionId, areaId, bdaId } = trial;

        // Fetch related details using dataExist
        const { regionExists, areaExists, bdaExists, bdaName} = await dataExist(regionId, areaId, bdaId);

        return {
          ...trial.toObject(),
          regionDetails: regionExists?.[0] || null, // Assuming regionExists is an array
          areaDetails: areaExists?.[0] || null,    // Assuming areaExists is an array
          bdaDetails:{
            bdaId: bdaExists[0]?._id || null,
            bdaName: bdaName || null,
          },      // Assuming bdaExists is an array
        };
      })
    );

    // Respond with the enriched trials data
    res.status(200).json({ trials: enrichedTrials });
  } catch (error) {
    console.error("Error fetching trials:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.getClientDetails = async (req, res) => {
  try {
    // Extract ID from request params
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required in the request parameters." });
    }

    // Configure Axios GET request
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Make a GET request to the external API with the ID in the URL
    const apiUrl = `https://dev.billbizz.cloud:5004/get-one-organization-nex/${id}`;
    const response = await axios.get(apiUrl, axiosConfig);

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


exports.convertTrialToLicenser = async (req, res) => {
  try {
    const { trialId } = req.params; // Assume the request contains the ID of the trial to convert.

    const { startDate,endDate} = req.body;


    // Find the trial by ID and update its customerStatus to "Licenser"
    const updatedTrial = await Leads.findByIdAndUpdate(
      trialId,
      { customerStatus: "Licenser",
        startDate,
        endDate
       },
      { new: true } // Return the updated document
    );

    // const emailSent = await sendClientCredentialsEmail(email, organizationName, contactName, password, startDate, endDate, isTrial = false );
    // if (!emailSent) {
    //   return res
    //     .status(500)
    //     .json({ success: false, message: 'Failed to send login credentials email' });
    // }

    // Check if the trial was found and updated
    if (!updatedTrial) {
      return res.status(404).json({ message: "Trial not found or unable to convert." });
    }

    res.status(200).json({ message: "Trial converted to Licenser successfully.", trial: updatedTrial });
  } catch (error) {
    console.error("Error converting Trial to Licenser:", error);
    res.status(500).json({ message: "Internal server error." });
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
    const existingUser = await User.findOne({
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
    if (existingUser.firstName === userName)
      duplicateMessages.push("Full name already exists");
    if (existingUser.email === email)
      duplicateMessages.push("Login email already exists");
    if (existingUser.phone === phone)
      duplicateMessages.push("Phone number already exists");
  
    return duplicateMessages.join(". ");
  };
  


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
validateField( typeof data.email === 'undefined', "email required", errors  );
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



exports.extendTrialDuration = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { duration } = req.body;

    // Validate request body
    if (!duration || isNaN(duration)) {
      return res.status(400).json({ message: "Valid duration is required." });
    }

    // Find the lead by ID
    const lead = await Leads.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    // Parse the current endDate from the database in YYYY-MM-DD format
    const currentEndDate = moment(lead.endDate, "YYYY-MM-DD");
    if (!currentEndDate.isValid()) {
      return res.status(400).json({ message: "Invalid end date in the database." });
    }

    // Calculate the new endDate
    const newEndDate = currentEndDate.add(parseInt(duration, 10), "days");

    // Update the lead
    lead.endDate = newEndDate.format("YYYY-MM-DD"); // Save in YYYY-MM-DD format
    lead.trialStatus = "Extended";
    lead.duration = duration; // Save the duration if needed

    // Save the updated lead
    await lead.save();

    res.status(200).json({
      message: "Trial duration extended successfully.",
      lead,
    });
  } catch (error) {
    console.error("Error extending trial duration:", error.message || error);
    res.status(500).json({ message: "Internal server error." });
  }
};
