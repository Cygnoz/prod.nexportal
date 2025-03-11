const Area = require('../database/model/area');
const Region = require('../database/model/region')
const Leads = require("../database/model/leads")
const mongoose = require('mongoose');
const Bda = require("../database/model/bda");
const User = require("../database/model/user");
const ActivityLogg = require('../database/model/activityLog');
const AreaManager = require("../database/model/areaManager");
const RegionManager = require("../database/model/regionManager");


// exports.addArea = async (req, res, next) => {
//     try {
//       const { areaCode, areaName, region, description } = req.body;
  
//       // Validate the required fields
//       if (!areaCode || !areaName || !region) {
//         return res.status(400).json({ message: "All required fields must be provided" });
//       }
  
//       // Check if the region exists in the Region collection
//       const existingRegion = await Region.findById(region);
//       if (!existingRegion) {
//         return res.status(404).json({ message: "The specified region does not exist" });
//       }
  
//       // Check if the areaCode or areaName already exists
//       const existingArea = await Area.findOne({
//         $or: [{ areaCode }, { areaName }],
//       });
//       if (existingArea) {
//         return res.status(400).json({ message: "Area code or name already exists" });
//       }
  
//       // Create a new area entry
//       const newArea = new Area({ areaCode, areaName, region, description });
  
//       await newArea.save();
//       res.status(201).json({ message: "Area added successfully"});
  
//       // Pass operation details to middleware
//       logOperation(req, "successfully", newArea._id);
//       next();
//     } catch (error) {
//       console.error("Error adding area:", error);
//       res.status(500).json({ message: "Internal server error" });
//       logOperation(req, "Failed");
//       next();
//     }
//   };
  

exports.addArea = async (req, res, next) => {
  try {
    const { areaName, region, description } = req.body;

    // Validate the required fields
    if ( !areaName || !region) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Count existing organizations to generate the next organizationId
  let nextId = 1;
  const lastArea = await Area.findOne().sort({ _id: -1 }); // Sort by creation date to find the last one
  if (lastArea) {
    const lastId = parseInt(lastArea.areaCode.slice(4)); // Extract the numeric part from the customerID
    nextId = lastId + 1; // Increment the last numeric part
  }    
  const areaCode = `AR-${nextId.toString().padStart(4, '0')}`;


    // Check if the region exists in the Region collection
    const existingRegion = await Region.findById(region);
    if (!existingRegion) {
      return res.status(404).json({ message: "The specified region does not exist" });
    }
    const status = "Active"
    // Check if the areaCode or areaName already exists
    const existingArea = await Area.findOne({
      $or: [ { areaName }],
    });
    if (existingArea) {
      return res.status(400).json({ message: "Area name already exists" });
    }

    // Create a new area entry
    const newArea = new Area({ areaCode, areaName, region, description, status  });

    await newArea.save();
    res.status(201).json({ message: "Area added successfully"});

    // Pass operation details to middleware
    logOperation(req, "successfully", newArea._id);
    next();
  } catch (error) {
    console.error("Error adding area:", error);
    res.status(500).json({ message: "Internal server error" });
    logOperation(req, "Failed");
    next();
  }
};

exports.getArea = async (req, res) => {
  try {
    const { areaId } = req.params;

    // Fetch the area and populate the region details
    const area = await Area.findById(areaId).populate('region', 'regionCode regionName').exec();

    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }

    // Fetch the area managers and populate the user details
    const areaManagers = await AreaManager.find({ area: areaId })
      .populate({
        path: 'user', // Reference field in AreaManager
        select: 'userName userImage', // Fields to take from the User collection
      })
      .select('_id'); // Select only _id from AreaManager

    // Send both area and areaManagers as a single response
    res.status(200).json({
      area,
      areaManagers
    });

  } catch (error) {
    console.error("Error fetching area:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getAllAreas = async (req, res) => {
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

      
      const areas = await Area.find(Query).populate('region', 'regionCode regionName');

      // if (areas.length === 0) {
      //   return res.status(404).json({ message: "No areas found" });
      // }
      const totalArea = areas.length;
      const totalAreaManagers = (await AreaManager.find(Query)).length;
      const totalBda = (await Bda.find(Query)).length;
      const leads = (await Leads.find(query))
      const totalLeads = leads.filter((Lead) => Lead.customerStatus === "Lead").length;


      res.status(200).json({ 
        areas,
        totalArea,
        totalAreaManagers,
        totalBda,
        totalLeads
       });
    } catch (error) {
      console.error("Error fetching all areas:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };



  exports.updateArea = async (req, res, next) => {
    try {
      const { areaId } = req.params;
      const { areaCode, areaName, region, description } = req.body;
  
      // Check if the region exists in the Region collection
      const existingRegion = await Region.findById(region);
      if (!existingRegion) {
        return res.status(400).json({ message: "Invalid region specified" });
      }
  
      // Check for duplicate areaCode or areaName
      const existingArea = await Area.findOne({
        $or: [{ areaCode }, { areaName }],
        _id: { $ne: areaId },
      });
  
      if (existingArea) {
        let message = "Conflict: ";
        if (existingArea.areaCode === areaCode) message += "areaCode already exists. ";
        if (existingArea.areaName === areaName) message += "areaName already exists. ";
        return res.status(400).json({ message: message.trim() });
      }
  
      // Update the area
      const updatedArea = await Area.findByIdAndUpdate(
        areaId,
        { areaCode, areaName, region, description },
        { new: true }
      );
  
      if (!updatedArea) {
        return res.status(404).json({ message: "Area not found" });
      }
  
      res.status(200).json({ message: "Area updated successfully", area: updatedArea });
  
      // Pass operation details to middleware
      logOperation(req, "successfully", updatedArea._id );
      next();
    } catch (error) {
      console.error("Error updating area:", error);
      res.status(500).json({ message: "Internal server error" });
      logOperation(req, "Failed");
      next();
    }
  };
  

  exports.deleteArea = async (req, res,next) => {
    try {
      const { areaId } = req.params;
  
      // Validate if areaId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(areaId)) {
        return res.status(400).json({ message: "Invalid Area ID." });
      }
  
      // Check if the area exists
      const area = await Area.findById(areaId);
      if (!area) {
        return res.status(404).json({ message: "Area not found." });
      }
  
      // Check if areaId is referenced in other collections
      const [lead, areaManager, bda] = await Promise.all([
        Leads.findOne({ areaId }),
        AreaManager.findOne({ area }),
        Bda.findOne({ area }),
     
      ]);
  
      if (lead || areaManager || bda ) {
        return res.status(400).json({
          message: "This area cannot be deleted as it is linked to other records.",
          referencedIn: {
            leads: !!lead, areaManager: !!areaManager, bda: !!bda,
          },
        });
      }
  
      const deletedArea = await Area.findByIdAndDelete(areaId);
      if (!deletedArea) {
        return res.status(404).json({ message: "Area not found." });
      }
  
      logOperation(req, "successfully", deletedArea._id);
      next();
  
      res.status(200).json({ message: "Area deleted successfully." });
      
    } catch (error) {
      console.error("Error deleting Area:", error.message || error);
  
      logOperation(req, "Failed");
      next();
  
      res.status(500).json({ message: "Internal server error." });
    }
  };
  

  // Deactivate an area
// Toggle the status of an area
exports.deactivateArea = async (req, res, next) => {
  try {
    const { areaId } = req.params; // Extract Area ID
    const { status } = req.body; // Extract status from request body

    // Validate the status
    if (!["Active", "Deactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value. Allowed values are 'Active' or 'Deactive'.",
      });
    }

    // Find the Area
    const area = await Area.findById(areaId);
    if (!area) {
      return res.status(404).json({ message: "Area not found." });
    }

    // Check if the Area is referenced before deactivation
    if (status === "Deactive") {
      const isReferenced = await Promise.any([
        AreaManager.exists({ area: areaId }),
        Bda.exists({ area: areaId }),
      ]);

      if (isReferenced) {
        return res.status(400).json({
          message: "Cannot deactivate Area: It is associated with Area Managers, Supervisors, or BDAs.",
        });
      }
    }

    // Update the Area's status
    area.status = status;
    await area.save(); // Updates `updatedAt` timestamp

    // Use `updatedAt` for logging
    const actionTime = area.updatedAt.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    // Log the operation
    const activity = new ActivityLogg({
      userId: req.user.id,
      operationId: areaId,
      activity: `${req.user.userName} successfully ${status}d Area.`,
      timestamp: actionTime,
      action: status === "Active" ? "Activate" : "Deactivate",
      status,
      screen: "Area",
    });
    await activity.save();

    // Respond with success
    return res.status(200).json({
      message: `Area status updated to ${status} successfully.`,
      area,
    });
  } catch (error) {
    console.error("Error updating Area status:", error);

    // Log the failure and respond with an error
    logOperation(req, "Failed");
    next();
    return res.status(500).json({ message: "Internal server error." });
  }
};

// overview
exports.getAreaDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch area and validate existence
    const area = await Area.findById(id).lean();
    if (!area) return res.status(404).json({ message: "Area not found" });

    // Fetch region details in parallel
    const [region, bdas, counts, areaManagerData] = await Promise.all([
      Region.findById(area.region, { regionName: 1, regionCode: 1 }).lean(),
      getBdaDetails(id), // Call the new function to fetch BDA details
      Promise.all([
        Bda.countDocuments({ area: id }),
        Leads.countDocuments({ areaId: id, customerStatus: "Lead"}),
        Leads.countDocuments({ areaId: id, customerStatus: "Licenser" }),
        Leads.countDocuments({ areaId: id, customerStatus: "Licenser", licensorStatus: "Active" }),
      ]),
      AreaManager.findOne({ area: id }).lean(),
    ]);

    // Extract counts
    const [totalBdas, totalLeads, totalLicensor, activeLicensor] = counts;

    // Fetch area manager details if available
    let areaManager = null;
    if (areaManagerData) {
      const user = await User.findById(areaManagerData.user, {
        userName: 1,
        email: 1,
        phoneNo: 1,
        userImage: 1,
      }).lean();
      if (user) areaManager = user;
    }

    // Construct response
    res.status(200).json({
      statistics: {
        areaManager,
        totalBdas,
        totalLeads,
        totalLicensor,
        activeLicensor,
      },
      bdas,
      region,
    });
  } catch (error) {
    console.error("Error fetching area details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const getBdaDetails = async (areaId) => {
//   // Fetch all BDA documents that match the area
//   const bdas = await Bda.find({ area: areaId }, { user: 1, dateOfJoining: 1 }).lean();

//   // Prepare array for BDA details
//   const bdaDetails = await Promise.all(
//     bdas.map(async (bda) => {
//       const user = await User.findById(bda.user, {
//         employeeId: 1,
//         userName: 1,
//         email: 1,
//         phoneNo: 1,
//         userImage: 1,
//       }).lean();

//       const totalLeads = await Leads.countDocuments({ areaId, bdaId: bda._id });
//       const leadsClosed = await Leads.countDocuments({
//         areaId,
//         bdaId: bda._id,
//         customerStatus: { $ne: "Lead" },
//       });

//       return {
//         _id :bda._id,
//         employeeId: user?.employeeId || null,
//         userName: user?.userName || null,
//         email: user?.email || null,
//         phoneNo: user?.phoneNo || null,
//         userImage: user?.userImage || null,
//         dateOfJoining: bda.dateOfJoining,
//         totalLeads,
//         leadsClosed,
//       };
//     })
//   );

//   return bdaDetails;
// };

// lead and conversion

const getBdaDetails = async (areaId) => {
  // Fetch all BDA documents that match the area
  const bdas = await Bda.find({ area: areaId }, { user: 1, dateOfJoining: 1 }).lean();
 
  // Prepare array for BDA details
  const bdaDetails = await Promise.all(
    bdas.map(async (bda) => {
      const user = await User.findById(bda.user, {
        employeeId: 1,
        userName: 1,
        email: 1,
        phoneNo: 1,
        userImage: 1,
      }).lean();
 
      const totalLeads = await Leads.countDocuments({ areaId, bdaId: bda._id });
 
      // Count converted leads for the BDA
      const convertedLeadsForBda = await Leads.countDocuments({
      bdaId: bda._id,
      customerStatus: { $ne: "Lead" }, // Non-leads are considered converted
      });
 
   // Adjust the conversion rate to cap at 100%
   const bdaConversionRate =
   totalLeads > 0
     ? Math.min(
         ((convertedLeadsForBda / totalLeads) * 100).toFixed(2),
         100
       )
     : "0";
 
 
      const leadsClosed = await Leads.countDocuments({
        areaId,
        bdaId: bda._id,
        customerStatus: { $ne: "Lead" },
      });
 
      return {
        _id :bda._id,
        employeeId: user?.employeeId || null,
        userName: user?.userName || null,
        email: user?.email || null,
        phoneNo: user?.phoneNo || null,
        userImage: user?.userImage || null,
        dateOfJoining: bda.dateOfJoining,
        totalLeads,
        leadsClosed,
        bdaConversionRate
      };
    })
  );
 
  return bdaDetails;
};
 

exports.getAreaLeadDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch active licenses
    const activeLicenses = await Leads.countDocuments({
      areaId: id,
      customerStatus: "Licenser",
      licensorStatus: "Active",
    });

    // Fetch expired licenses
    const expiredLicenses = await Leads.countDocuments({
      areaId: id,
      customerStatus: "Licenser",
      licensorStatus: "Expired",
    });

    // Total leads for the area
    const totalLeads = await Leads.countDocuments({ areaId: id });

    // Converted leads (not "Lead" status)
    const convertedLeads = await Leads.countDocuments({
      areaId: id,
      customerStatus: { $ne: "Lead" },
    });

    // Calculate lead conversion rate
    const leadConversionRate =
      totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;

    // Fetch leads array
    const leads = await Leads.find({
      areaId: id,
      customerStatus: "Lead",
    })
      .select("customerId image firstName email phone bdaId leadSource leadStatus")
      .populate({
        path: "bdaId",
        select: "user",
        populate: {
          path: "user",
          select: "userName userImage",
        },
      });

    // Map leads array to format bdaId as bdaName
    const formattedLeads = leads.map((lead) => ({
      _id:lead._id,
      customerId: lead.customerId,
      image: lead.image,
      firstName: lead.firstName,
      email: lead.email,
      phone: lead.phone,
      leadSource: lead.leadSource,
      leadStatus: lead.leadStatus,
      bdaName: lead.bdaId?.user?.userName || null, // Convert bdaId to bdaName
    }));

    // Fetch licensors array
    const licensors = await Leads.find({
      areaId: id,
      customerStatus: "Licenser",
    }).select("firstName image licensorStatus startDate endDate");

    // Send the response
    res.status(200).json({
      activeLicenses,
      expiredLicenses,
      leadConversionRate: `${leadConversionRate}%`,
      leads: formattedLeads,
      licensors, // Include licensors array in the response
    });
  } catch (error) {
    console.error("Error fetching area lead details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getActivityLogByAreaId = async (req, res) => {
  try {
    const { id } = req.params;
console.log(id);

    // Step 1: Find activity logs where operationId matches the provided Area ID
    const areaLogs = await ActivityLogg.find({ operationId: id }).populate('userId', 'userName userImage');

    // Step 2: Query AreaManager to get documents where area matches the provided id
    const areaManagers = await AreaManager.find({ area: id });

    // Step 3: Extract AreaManager IDs
    const areaManagerIds = areaManagers.map(manager => manager._id.toString());

    // Step 4: Find activity logs where operationId matches any AreaManager ID
    const areaManagerLogs = await ActivityLogg.find({ operationId: { $in: areaManagerIds } }).populate('userId', 'userName userImage');

    // Step 5: Query Bda to get documents where area matches the provided id
    const bdaDocuments = await Bda.find({ area: id });

    // Step 6: Extract Bda IDs
    const bdaIds = bdaDocuments.map(bda => bda._id.toString());

    // Step 7: Find activity logs where operationId matches any Bda ID
    const bdaLogs = await ActivityLogg.find({ operationId: { $in: bdaIds } }).populate('userId', 'userName userImage');

    // Step 8: Query Leads to get documents where areaId matches the provided id
    const leadsDocuments = await Leads.find({ areaId: id });

    // Step 9: Extract Leads IDs
    const leadsIds = leadsDocuments.map(lead => lead._id.toString());

    // Step 10: Find activity logs where operationId matches any Leads ID
    const leadsLogs = await ActivityLogg.find({ operationId: { $in: leadsIds } }).populate('userId', 'userName userImage');

    // Step 11: Combine all logs and sort by timestamp in descending order
    const logs = [
      ...areaLogs,
      ...areaManagerLogs,
      ...bdaLogs,
      ...leadsLogs
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Step 12: Get only the last 10 documents
    const limitedLogs = logs.slice(0, 10);

    // Step 13: Check if logs are empty
    if (limitedLogs.length === 0) {
      return res.status(404).json({ message: "No activity logs found for the provided Area ID" });
    }

    // Step 14: Send the combined logs as the response
    res.status(200).json(limitedLogs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};









  



const logOperation = (req, status, operationId = null) => {
    const { id, userName } = req.user;
    const log = { id, userName, status };
  
    if (operationId) {
      log.operationId = operationId;
    }
  
    req.user = log;
  };
  