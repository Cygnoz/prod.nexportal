const Area = require('../database/model/area');
const Region = require('../database/model/region')
const Leads = require("../database/model/leads")
const mongoose = require('mongoose');
const Bda = require("../database/model/bda");
const User = require("../database/model/user");

const AreaManager = require('../database/model/areaManager')

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

    const area = await Area.findById(areaId).populate('region', 'regionCode regionName').exec();
    
    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }

    res.status(200).json(area);
  } catch (error) {
    console.error("Error fetching area:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllAreas = async (req, res) => {
    try {
      const areas = await Area.find({}).populate('region', 'regionCode regionName');
  
      if (areas.length === 0) {
        return res.status(404).json({ message: "No areas found" });
      }
  
      res.status(200).json({ message: "Areas retrieved successfully", areas });
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
  

  exports.deleteArea = async (req, res) => {
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
          message: "Cannot delete Area because it is referenced in another collection.",
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
exports.deactivateArea = async (req, res) => {
  try {
    const { areaId } = req.params;

    // Find the area by ID and update the status to "Deactivate"
    const updatedArea = await Area.findByIdAndUpdate(
      areaId,
      { status: "Deactivate" },
      { new: true } // Return the updated document
    );

    // If the area does not exist
    if (!updatedArea) {
      return res.status(404).json({ message: "Area not found" });
    }

    res.status(200).json({
      message: "Area deactivated successfully",
      area: updatedArea,
    });
  } catch (error) {
    console.error("Error deactivating area:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
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
        Leads.countDocuments({ areaId: id}),
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
      };
    })
  );

  return bdaDetails;
};

// lead and conversion
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
          select: "userName",
        },
      });

    // Map leads array to format bdaId as bdaName
    const formattedLeads = leads.map((lead) => ({
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
    }).select("firstName licensorStatus startDate endDate");

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








  



const logOperation = (req, status, operationId = null) => {
    const { id, userName } = req.user;
    const log = { id, userName, status };
  
    if (operationId) {
      log.operationId = operationId;
    }
  
    req.user = log;
  };
  