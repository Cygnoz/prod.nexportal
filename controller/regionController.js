const Region = require("../database/model/region");
const Area = require("../database/model/area");
const Leads = require("../database/model/leads");
const User = require("../database/model/user");
const mongoose = require("mongoose");
const RegionManager = require("../database/model/regionManager");
const AreaManager = require("../database/model/areaManager");
const Bda = require("../database/model/bda");
const Supervisor = require("../database/model/supervisor");
const SupportAgent = require("../database/model/supportAgent");
const ActivityLogg = require('../database/model/activityLog');

const moment = require("moment");

exports.addRegion = async (req, res, next) => {
  try {
    const { regionName, country, description } = req.body;

    // Validate the required fields
    if (!regionName || !country) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }
    // Count existing organizations to generate the next organizationId
    let nextId = 1;
    const lastRegion = await Region.findOne().sort({ _id: -1 }); // Sort by creation date to find the last one
    if (lastRegion) {
      const lastId = parseInt(lastRegion.regionCode.slice(4)); // Extract the numeric part from the customerID
      nextId = lastId + 1; // Increment the last numeric part
    }
    const regionCode = `REG-${nextId.toString().padStart(4, "0")}`;
    const status = "Active";

    // Check if the regionCode already exists
    const existingRegion = await Region.findOne({
      $or: [{ regionName }],
    });
    if (existingRegion) {
      return res.status(400).json({ message: "Region name already exists" });
    }
    // Create a new region entry
    const newRegion = new Region({
      regionCode,
      regionName,
      country,
      description,
      status,
    });

    await newRegion.save();
    res
      .status(201)
      .json({ message: "Region added successfully", region: newRegion });

    // Pass operation details to middleware
    ActivityLog(req, "successfully", newRegion._id);
    next();
  } catch (error) {
    console.error("Error adding region:", error);
    res.status(500).json({ message: "Internal server error" });
    ActivityLog(req, "Failed");
    next();
  }
};

// exports.getRegion = async (req, res) => {
//   try {
//     const { regionId } = req.params;

//     const region = await Region.findById(regionId);
//     if (!region) {
//       return res.status(404).json({ message: "Region not found" });
//     }

//     res.status(200).json(region);
//   } catch (error) {
//     console.error("Error fetching region:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };



exports.getRegion = async (req, res) => {
  try {
    const { regionId } = req.params;

    // Fetch the region by ID
    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }

    // Fetch the region manager for the given regionId
    const regionManager = await RegionManager.findOne({ region: regionId }).populate({
      path: "user",
      select: "userName email phoneNo",
    });

    // Prepare the response
    const response = {
      region,
    };

    // Add regionManager details if it exists
    if (regionManager) {
      response.regionManager = {
        userName: regionManager.user.userName,
        email: regionManager.user.email,
        phoneNo: regionManager.user.phoneNo,
      };
    }

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching region:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.getAllRegions = async (req, res) => {
  try {
    const regions = await Region.find();

    if (regions.length === 0) {
      return res.status(404).json({ message: "No regions found" });
    }

    res
      .status(200)
      .json({ message: "Regions retrieved successfully", regions });
  } catch (error) {
    console.error("Error fetching all regions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateRegion = async (req, res, next) => {
  try {
    const { regionId } = req.params;
    const { regionCode, regionName, country, description } = req.body;

    const existingRegion = await Region.findOne({
      $or: [{ regionCode }, { regionName }],
      _id: { $ne: regionId },
    });

    if (existingRegion) {
      let message = "Conflict: ";
      if (existingRegion.regionCode === regionCode)
        message += "regionCode already exists. ";
      if (existingRegion.regionName === regionName)
        message += "regionName already exists. ";
      return res.status(400).json({ message: message.trim() });
    }

    const updatedRegion = await Region.findByIdAndUpdate(
      regionId,
      { regionCode, regionName, country, description },
      { new: true }
    );

    if (!updatedRegion) {
      return res.status(404).json({ message: "Region not found" });
    }

    res
      .status(200)
      .json({ message: "Region updated successfully", region: updatedRegion });

    // Pass operation details to middleware
    ActivityLog(req, "successfully", updatedRegion._id);
    next();
  } catch (error) {
    console.error("Error updating region:", error);
    res.status(500).json({ message: "Internal server error" });
    ActivityLog(req, "Failed");
    next();
  }
};

exports.deleteRegion = async (req, res, next) => {
  try {
    const { regionId } = req.params;

    // Validate if regionId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(regionId)) {
      return res.status(400).json({ message: "Invalid Region ID." });
    }

    // Check if the region exists
    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(404).json({ message: "Region not found." });
    }

    // Check if regionId is referenced in Leads or Area collections
    const [
      lead,
      area,
      regionManager,
      areaManager,
      bda,
      supervisor,
      supportAgent,
    ] = await Promise.all([
      Leads.findOne({ regionId }),
      Area.findOne({ region }),
      RegionManager.findOne({ region }),
      AreaManager.findOne({ region }),
      Bda.findOne({ region }),
      Supervisor.findOne({ region }),
      SupportAgent.findOne({ region }),
    ]);

    if (
      lead ||
      area ||
      regionManager ||
      areaManager ||
      bda ||
      supervisor ||
      supportAgent
    ) {
      return res.status(400).json({
        message:
          "This region cannot be deleted as it is linked to other records.",
        referencedIn: {
          leads: !!lead,
          area: !!area,
          regionManager: !!regionManager,
          areaManager: !!areaManager,
          bda: !!bda,
          supervisor: !!supervisor,
          supportAgent: !!supportAgent,
        },
      });
    }

    // Delete the region
    const deletedRegion = await Region.findByIdAndDelete(regionId);
    if (!deletedRegion) {
      return res.status(404).json({ message: "Region not found." });
    }

    // Log successful operation
    ActivityLog(req, "successfully", deletedRegion._id);
    next();

    res.status(200).json({ message: "Region deleted successfully." });
  } catch (error) {
    console.error("Error deleting Region:", error.message || error);

    // Log error as failure
    ActivityLog(req, "Failed");
    next();

    res.status(500).json({ message: "Internal server error." });
  }
};

   // Deactivate a region and its associated areas
// Toggle the status of a region
exports.deactivateRegion = async (req, res, next) => {
  try {
    const { regionId } = req.params; // Extract Region ID
    const { status } = req.body; // Extract status from request body
 
    // Validate the status
    if (!["Active", "Deactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value. Allowed values are 'Active' or 'Deactive'.",
      });
    }
 
    // Find the Region
    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(404).json({ message: "Region not found." });
    }
 
    // Check if the Region is referenced before deactivation
    if (status === "Deactive") {
      const isReferenced = await Promise.any([
        RegionManager.exists({ region: regionId }),
        AreaManager.exists({ region: regionId }),
        Supervisor.exists({ region: regionId }),
        Bda.exists({ region: regionId }),
        SupportAgent.exists({ region: regionId }),
      ]);

      if (isReferenced) {
        return res.status(400).json({
          message: "Cannot deactivate Region: It is associated with Region Managers, Supervisors, BDAs, or Support Agents.",
        });
      }
    }
 
    // Update the Region's status
    region.status = status;
    await region.save(); // Updates `updatedAt` timestamp
 
    // Use `updatedAt` for logging
    const actionTime = region.updatedAt.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    // Log the operation
    const activity = new ActivityLogg({
      userId: req.user.id,
      operationId: regionId,
      activity: `${req.user.userName} successfully ${status}d Region.`,
      timestamp: actionTime,
      action: status === "Active" ? "Activate" : "Deactivate",
      status,
      screen: "Region",
    });
    await activity.save();
 
    // Respond with success
    return res.status(200).json({
      message: `Region status updated to ${status} successfully.`,
      region,
    });
  } catch (error) {
    console.error("Error updating Region status:", error);
 
    // Log the failure and respond with an error
    ActivityLogg(req, "Failed");
    next();
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getAreasByRegion = async (req, res) => {
  try {
    const { id: regionId } = req.params;

    // Check if the region exists
    const regionExists = await Region.findById(regionId);
    if (!regionExists) {
      return res.status(404).json({ message: "Region not found" });
    }

    // Find areas associated with the given region
    const areas = await Area.find({ region: regionId });

    if (areas.length === 0) {
      return res
        .status(404)
        .json({ message: "No areas found for the given region" });
    }

    // Transform areas to include areaCode, areaName, and userName
    const transformedAreas = await Promise.all(
      areas.map(async (area) => {
        const areaManager = await AreaManager.findOne({ area: area._id });
        let userName = null;
        let userImage = null;

        if (areaManager && areaManager.user) {
          const user = await User.findById(areaManager.user, {
            userName: 1,
            userImage: 1,
          });
          if (user) {
            userName = user.userName;
            userImage = user.userImage;
          }
        }

        return {
          _id: area._id,
          areaCode: area.areaCode,
          areaName: area.areaName,
          userName,
          userImage, // Include userImage in the response
        };
      })
    );

    // Count AreaManagers associated with the given region
    const totalAreaManagers = await AreaManager.countDocuments({
      region: regionId,
    });

    // Count BDAs associated with the given region
    const totalBdas = await Bda.countDocuments({
      region: regionId,
    });

    // Count Licensors in the Leads collection
    const totalLicensors = await Leads.countDocuments({
      customerStatus: "Licenser",
      regionId: regionId,
    });

    // Fetch Licensers with specified fields
    const licensers = await Leads.find(
      { customerStatus: "Licenser", regionId },
      { customerId: 1, firstName: 1, licensorStatus: 1, image:1 }
    );

    // Get the current month's start and end dates
    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    // Count Leads for the current month
    const totalLeadThisMonth = await Leads.countDocuments({
      customerStatus: "Lead",
      regionId: regionId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Fetch the Region Manager details
    const regionManagerData = await RegionManager.findOne({ region: regionId });
    let regionManager = null;

    if (regionManagerData) {
      const user = await User.findById(regionManagerData.user, {
        userName: 1,
        email: 1,
        phoneNo: 1,
        userImage: 1,
      });

      if (user) {
        regionManager = {
          userName: user.userName,
          email: user.email,
          phoneNo: user.phoneNo,
          userImage: user.userImage,
        };
      }
    }

    res.status(200).json({
      areas: transformedAreas,
      licensers,
      totalAreaManagers,
      totalBdas,
      totalLicensors,
      totalLeadThisMonth,
      regionManager,
    });
  } catch (error) {
    console.error("Error fetching areas by region:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getRegionDetails = async (req, res) => {
  try {
    const { id: regionId } = req.params;

    // Check if the region exists
    const regionExists = await Region.findById(regionId);
    if (!regionExists) {
      return res.status(404).json({ message: "Region not found" });
    }

    // Fetch data and counts from collections, populating `user` reference fields
    const [areaManagers, bdas, regionManagers, supervisors, supportAgents] =
      await Promise.all([
        AreaManager.find({ region: regionId })
          .select("user area") // Include only `user` and `area` fields from the AreaManager collection
          .populate({
            path: "user",
            select: "userName email userImage phoneNo", // Select only the specified fields from User
          })
          .populate({
            path: "area",
            select: "areaName", // Replace 'name' and 'location' with the specific fields you want from the Area model
          }),
        Bda.find({ region: regionId })
          .select("user area") // Include only `user` and `area` fields from the Bda collection
          .populate({
            path: "user",
            select: "employeeId userName email userImage phoneNo", // Select only the specified fields from User
          })
          .populate({
            path: "area",
            select: "areaName", // Replace 'name' and 'location' with the specific fields you want from the Area model
          }),
        RegionManager.find({ region: regionId }).populate({
          path: "user",
          select: "userName email userImage phoneNo",
        }),
        Supervisor.find({ region: regionId }).populate({
          path: "user",
          select: "userName email userImage phoneNo",
        }),
        SupportAgent.find({ region: regionId }).populate({
          path: "user",
          select: "userName email userImage phoneNo",
        }),
      ]);

    // Fetch active team members with status: "Active", also populating `user` fields
    const [
      activeAreaManagers,
      activeBdas,
      activeRegionManagers,
      activeSupervisors,
      activeSupportAgents,
    ] = await Promise.all([
      AreaManager.find({ region: regionId, status: "Active" }).populate({
        path: "user",
        select: "userName email userImage phoneNo",
      }),
      Bda.find({ region: regionId, status: "Active" }).populate({
        path: "user",
        select: "userName email userImage phoneNo",
      }),
      RegionManager.find({ region: regionId, status: "Active" }),
      Supervisor.find({ region: regionId, status: "Active" }),
      SupportAgent.find({ region: regionId, status: "Active" }),
    ]);

    // Fetch leads assigned based on regionId and customerStatus
    const leadsAssigned = await Leads.countDocuments({
      regionId,
      customerStatus: "Lead",
    });

    // Calculate total team members
    const totalTeamMembers =
      areaManagers.length +
      bdas.length +
      regionManagers.length +
      supervisors.length +
      supportAgents.length;

    // Calculate total active team members
    const activeTeamMembers =
      activeAreaManagers.length +
      activeBdas.length +
      activeRegionManagers.length +
      activeSupervisors.length +
      activeSupportAgents.length;

    // Prepare response
    res.status(200).json({
      areaManagers,
      bdas,
      totalTeamMembers,
      activeTeamMembers,
      leadsAssigned,
    });
  } catch (error) {
    console.error("Error fetching region details:", error);
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


// exports.getActivityLogByOperationId = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Step 1: Aggregate to fetch all logs from related collections using $lookup
//     const logs = await ActivityLogg.aggregate([
//       // Match logs for the provided regionId (operationId)
//       {
//         $match: {
//           operationId: id
//         }
//       },
//       // Lookup Area
//       {
//         $lookup: {
//           from: "Area", // Assuming the collection name for areas is 'areas'
//           localField: "operationId",
//           foreignField: "_id",
//           as: "areaLogs"
//         }
//       },
//       // Lookup AreaManager
//       {
//         $lookup: {
//           from: "areamanagers", // Assuming the collection name for AreaManagers is 'areamanagers'
//           localField: "operationId",
//           foreignField: "_id",
//           as: "areaManagerLogs"
//         }
//       },
//       // Lookup RegionManager
//       {
//         $lookup: {
//           from: "regionmanagers", // Assuming the collection name for RegionManagers is 'regionmanagers'
//           localField: "operationId",
//           foreignField: "_id",
//           as: "regionManagerLogs"
//         }
//       },
//       // Lookup Bda
//       {
//         $lookup: {
//           from: "bdas", // Assuming the collection name for BDA is 'bda'
//           localField: "operationId",
//           foreignField: "_id",
//           as: "bdaLogs"
//         }
//       },
//       // Lookup Leads
//       {
//         $lookup: {
//           from: "leads", // Assuming the collection name for Leads is 'leads'
//           localField: "operationId",
//           foreignField: "_id",
//           as: "leadsLogs"
//         }
//       },
//       // Filter and Combine all logs into one array
//       {
//         $project: {
//           combinedLogs: {
//             $concatArrays: [
//               "$areaLogs",
//               "$areaManagerLogs",
//               "$regionManagerLogs",
//               "$bdaLogs",
//               "$leadsLogs"
//             ]
//           }
//         }
//       },
//       // Unwind to flatten the combined logs array
//       {
//         $unwind: {
//           path: "$combinedLogs",
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       // Sort by timestamp in descending order
//       {
//         $sort: {
//           "combinedLogs.timestamp": -1
//         }
//       },
//       // Optionally, limit the number of logs if pagination is required
//       {
//         $limit: 100 // Adjust the limit as necessary
//       }
//     ]);

//     // Step 2: Check if logs are empty
//     if (!logs.length) {
//       return res.status(404).json({ message: "No activity logs found for the provided operation ID" });
//     }

//     // Step 3: Send the combined and sorted logs as the response
//     res.status(200).json(logs);
//   } catch (error) {
//     console.error("Error fetching activity logs:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


exports.getActivityLogByOperationId = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find all areas where region matches the provided id
    const areas = await Area.find({ region: id });

    

    // Step 2: Extract all area IDs and convert them to strings
    const areaIds = areas.map(area => area._id.toString());

    // Step 3: Find activity logs for areaIds
    const areaLogs = await ActivityLogg.find({ operationId: { $in: areaIds } }).populate('userId', 'userName userImage');

    // Step 4: Find activity logs for region ID
    const regionLogs = await ActivityLogg.find({ operationId: id }).populate('userId', 'userName userImage');
    console.log(regionLogs);
    
    // Step 5: Query AreaManager to get documents where region matches the provided id
    const areaManagers = await AreaManager.find({ region: id });

    // Step 6: Extract AreaManager IDs
    const areaManagerIds = areaManagers.map(manager => manager._id.toString());

    // Step 7: Find activity logs where operationId matches any AreaManager ID
    const areaManagerLogs = await ActivityLogg.find({ operationId: { $in: areaManagerIds } }).populate('userId', 'userName userImage');

    // Step 8: Query RegionManager to get documents where region matches the provided id
    const regionManagers = await RegionManager.find({ region: id });

    // Step 9: Extract RegionManager IDs
    const regionManagerIds = regionManagers.map(manager => manager._id.toString());

    // Step 10: Find activity logs where operationId matches any RegionManager ID
    const regionManagerLogs = await ActivityLogg.find({ operationId: { $in: regionManagerIds } }).populate('userId', 'userName userImage');

    // Step 11: Query Bda to get documents where region matches the provided id
    const bdaDocuments = await Bda.find({ region: id });

    // Step 12: Extract Bda IDs
    const bdaIds = bdaDocuments.map(bda => bda._id.toString());

    // Step 13: Find activity logs where operationId matches any Bda ID
    const bdaLogs = await ActivityLogg.find({ operationId: { $in: bdaIds } }).populate('userId', 'userName userImage');

    // Step 14: Query Leads to get documents where regionId matches the provided id
    const leadsDocuments = await Leads.find({ regionId: id });

    // Step 15: Extract Leads IDs
    const leadsIds = leadsDocuments.map(lead => lead._id.toString());

    // Step 16: Find activity logs where operationId matches any Leads ID
    const leadsLogs = await ActivityLogg.find({ operationId: { $in: leadsIds } }).populate('userId', 'userName userImage');

    // Step 17: Combine all logs and sort by timestamp in descending order
    const logs = [
      ...areaLogs,
      ...regionLogs,
      ...areaManagerLogs,
      ...regionManagerLogs,
      ...bdaLogs,
      ...leadsLogs
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Step 18: Get only the last 10 documents
    // console.log("Full logs",logs);
    
    const limitedLogs = logs.slice(0, 10);

    // Step 19: Check if logs are empty
    if (limitedLogs.length === 0) {
      return res.status(404).json({ message: "No activity logs found for the provided operation ID" });
    }

    // Step 20: Send the combined logs as the response
    res.status(200).json(limitedLogs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.getAllAreaAndRegion = async (req, res) => {
  try {
    const [areas, regions] = await Promise.all([
      Area.find().populate("region", "regionName regionCode"), // Populating region details in areas
      Region.find()
    ]);

    if (areas.length === 0 && regions.length === 0) {
      return res.status(404).json({ message: "No areas or regions found" });
    }

    res.status(200).json({
      message: "Areas and regions retrieved successfully",
      areas,
      regions
    });

    console.log('area and region',areas , regions)
  } catch (error) {
    console.error("Error fetching areas and regions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
