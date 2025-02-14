// controllers/targetController.js
const Target = require("../database/model/target");
const Area = require("../database/model/area")
const User = require('../database/model/user')
const RegionManager = require("../database/model/regionManager");
const AreaManager = require("../database/model/areaManager");
const Bda = require("../database/model/bda");
const mongoose = require("mongoose");

const Leads = require("../database/model/leads")
 
 

function cleanTargetData(data) {
  const cleanData = (value) =>
    value === null || value === undefined || value === "" || value === 0
      ? undefined
      : value;
  return Object.keys(data).reduce((acc, key) => {
    acc[key] = cleanData(data[key]);
    return acc;
  }, {});
}


function createNewTarget(data) {
  const newTarget = new Target(data);
  return newTarget.save();
}


exports.addTarget = async (req, res) => {
  try {
      const userId = req.user.id;
      const { month, target, targetType, region, area } = req.body;
 
      // Fetch user details
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      console.log(user.role);
      
 
      let regionData = null;
      let parentTarget = 0;
 
      // Determine role and fetch corresponding region & parent target
      if (user.role === "Super Admin") {
          // SuperAdmin can set targets freely
          parentTarget = target;
      } else if (user.role === "Region Manager") {
          // Get the region assigned to this region manager
          regionData = await RegionManager.findOne({ user: userId }).populate("region");
          if (!regionData || !regionData.region) {
              return res.status(400).json({ error: "Region not assigned to this user." });
          }
         
          // Get the existing region target set by SuperAdmin
          const regionTarget = await Target.findOne({ region: regionData.region._id, targetType: "Region", month });
          if (!regionTarget) {
              return res.status(400).json({ error: "Region target not set by SuperAdmin." });
          }
 
          parentTarget = regionTarget.target; // SuperAdmin-set region target
 
          // Get total assigned area targets under this region
          const assignedAreaTargets = await Target.aggregate([
              { $match: { region: regionData.region._id, targetType: "Area", month } },
              { $group: { _id: null, total: { $sum: "$target" } } }
          ]);
          const totalAssigned = assignedAreaTargets.length > 0 ? assignedAreaTargets[0].total : 0;
 
          if (totalAssigned + target > parentTarget) {
              return res.status(400).json({ error: "Target exceeds allocated region limit." });
          }
      } else if (user.role === "Area Manager") {
          // Get the area assigned to this area manager
          const areaData = await AreaManager.findOne({ user: userId }).populate("area");
          if (!areaData || !areaData.area) {
              return res.status(400).json({ error: "Area not assigned to this user." });
          }
 
          // Get the existing area target set by Region Manager
          const areaTarget = await Target.findOne({ area: areaData.area._id, targetType: "Area", month });
          if (!areaTarget) {
              return res.status(400).json({ error: "Area target not set by Region Manager." });
          }
 
          parentTarget = areaTarget.target; // Region Manager-set area target
 
          // Get total assigned BDA targets under this area
          const assignedBDATargets = await Target.aggregate([
              { $match: { area: areaData.area._id, targetType: "BDA", month } },
              { $group: { _id: null, total: { $sum: "$target" } } }
          ]);
          const totalAssigned = assignedBDATargets.length > 0 ? assignedBDATargets[0].total : 0;
 
          if (totalAssigned + target > parentTarget) {
              return res.status(400).json({ error: "Target exceeds allocated area limit." });
          }
      } else {
          return res.status(403).json({ error: "Unauthorized role" });
      }
 
      // Create and save the target
      const newTarget = new Target({
          region: region || (regionData ? regionData.region._id : null),
          area,
          month,
          target,
          targetType
      });
 
      const savedTarget = await newTarget.save();
      return res.json({ message: "Target added successfully", savedTarget });
 
  } catch (error) {
      console.error("Error adding Target:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};

  exports.getAllTargets = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("User ID:", userId);
 
        const user = await User.findById(userId).select("role");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
 
        const { role } = user;
        console.log("User Role:", role);
        let query = {};
 
        if (role === "Super Admin") {
            query = {}; // Super Admin gets all targets
        }
        else if (role === "Region Manager") {
          // Get the Region Manager's assigned region
          const regionManager = await RegionManager.findOne({ user: userId }).populate("region");
          if (!regionManager || !regionManager.region) {
              return res.status(404).json({ error: "Region Manager or assigned region not found." });
          }
     
          const regionId = regionManager.region._id;
          console.log("Region ID:", regionId);
     
          // Fetch areas under this region
          const areas = await Area.find({ region: regionId }).select("_id");
          const areaIds = areas.map(a => a._id);
     
          console.log("Area IDs under Region:", areaIds);
     
          // Fetch BDAs under these areas
          const bdas = await Bda.find({ area: { $in: areaIds } }).select("_id");
          const bdaIds = bdas.map(b => new mongoose.Types.ObjectId(b._id));
     
          console.log("BDA IDs under Region:", bdaIds);
     
          // Fetch targets for region, areas under the region, and BDAs under those areas
          query = {
              $or: [
                  { region: regionId, targetType: "Region" }, // Region-level target
                  { area: { $in: areaIds }, targetType: "Area" }, // Area-level target
                  { bda: { $in: bdaIds }, targetType: "Bda" } // BDA-level target under the region
              ]
          };
      }
     
        else if (role === "Area Manager") {
          // Get the Area Manager's assigned area
          const areaManager = await AreaManager.findOne({ user: userId }).populate("area");
          if (!areaManager || !areaManager.area) {
              return res.status(404).json({ error: "Area Manager or assigned area not found." });
          }
     
          const areaId = areaManager.area._id;
          console.log("Area ID:", areaId);
     
          // Fetch BDAs under this area
          const bdas = await Bda.find({ area: areaId }).select("_id");
          const bdaIds = bdas.map(b => new mongoose.Types.ObjectId(b._id));
     
          console.log("BDA IDs under Area Manager:", bdaIds);
     
          // Show only BDA-level targets (exclude region and area targets)
          query = {
              bda: { $in: bdaIds },
              targetType: "Bda"
          };
      }
     
        else {
            return res.status(403).json({ error: "Unauthorized role." });
        }
 
        console.log("Final Query:", JSON.stringify(query, null, 2));
 
        // Fetch targets based on the updated query
        const targets = await Target.find(query)
            .populate("region", "_id regionName")
            .populate("area", "_id areaName")
            .populate({
                path: "bda",
                select: "_id user",
                populate: {
                    path: "user",
                    select: "userName userImage",
                },
            });
 
        console.log("Fetched Targets:", targets);
 
        if (!targets || targets.length === 0) {
            return res.status(404).json({ message: "No targets found." });
        }
 
        // Categorize targets
        const regionTargets = targets.filter(item => item.targetType === "Region");
        const areaTargets = targets.filter(item => item.targetType === "Area");
        const bdaTargets = targets.filter(item => item.targetType === "Bda");
 
        // Calculate totals safely (ensure target is a number)
        const totalRegionTarget = regionTargets.reduce((sum, target) => sum + (target.target || 0), 0);
        const totalAreaTarget = areaTargets.reduce((sum, target) => sum + (target.target || 0), 0);
        const totalBdaTarget = bdaTargets.reduce((sum, target) => sum + (target.target || 0), 0);
 
        return res.status(200).json({
            message: "Targets retrieved successfully",
            totalRegionTarget,
            totalAreaTarget,
            totalBdaTarget,
            region: regionTargets.length ? regionTargets : [],
            area: areaTargets.length ? areaTargets : [],
            bda: bdaTargets.length ? bdaTargets : [],
        });
 
    } catch (error) {
        console.error("Error fetching targets:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
 

  exports.getTargetById = async (req, res) => {
    try {
      const { id } = req.params;
 
      // Fetch the target by ID and populate necessary fields
      const target = await Target.findById(id)
        .populate("region", "_id regionName")  // Populate region details
        .populate("area", "_id areaName")    // Populate area details
        .populate({
          path: "bda",
          select: "user",  // Only populate the user field
          populate: {
            path: "user",  // Populate user details
            select: "userName userImage",
          },
        });
 
      // Check if the target exists
      if (!target) {
        return res.status(404).json({ error: "Target not found" });
      }
 
      // Return the target with populated details
      res.status(200).json({
        message: "Target retrieved successfully",
        target,
      });
    } catch (error) {
      console.error("Error fetching target:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


  exports.updateTarget = async (req, res, next) => {
    try {
      const updateData = {
        ...req.body
      };
  
      const updatedTarget = await Target.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
  
      if (!updatedTarget) {
        return res.status(404).json({ error: "Target not found" });
      }

      ActivityLog(req, "Successfully", updatedTarget._id);
      res.status(200).json({ message: "Target updated successfully" });
      next();

    } catch (error) {
      console.error("Error updating Target:", error);
      ActivityLog(req, "Failed");
      res.status(500).json({ message: "Internal server error." });
      next()

    }
  };
  


// Delete Target
exports.deleteTarget = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      // Check if the target exists
      const target = await Target.findById(id);
      if (!target) {
        return res.status(404).json({ message: "Target not found." });
      }
  
      // Delete the target
      const deletedTarget = await Target.findByIdAndDelete(id);
      if (!deletedTarget) {
        return res.status(404).json({ message: "Target not found." });
      }
  
      // Log the operation
      ActivityLog(req, "successfully", deletedTarget._id);
      next();
  
      res.status(200).json({ message: "Target deleted successfully." });
    } catch (error) {
      console.error("Error deleting target:");
      res.status(500).json({ message: "Internal server error." });
      ActivityLog(req, "failed");
      next();
    }
  };


 
  
  exports.getAchievedTargets = async (req, res) => {
    try {
        const userId = req.user.id;
        let { month } = req.query;
 
        if (!month) {
            return res.status(400).json({ error: "Month is required as a query parameter." });
        }
 
        if (month.length === 10) {
            month = month.slice(0, 7);
        }
 
        console.log("User ID:", userId, "Query Month:", month);
 
        const monthName = convertMonth(month);
        console.log("Converted Month:", monthName);
 
        const startDate = new Date(`${month}-01T00:00:00.000Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        console.log("Date Range:", startDate.toISOString(), "to", endDate.toISOString());
 
        const user = await User.findById(userId).select("role");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
 
        const { role } = user;
        console.log("User Role:", role);
 
        let totalTarget = 0;
        let achievedTargets = 0;
        let targetFilter = {};
        let leadsFilter = {};
 
               if (role === "Super Admin") {
            const targetRecords = await Target.find({
                month: { $regex: monthName, $options: "i" },
                region: { $exists: true }
            });
 
            totalTarget = targetRecords.reduce((acc, record) => acc + (record.target || 0), 0);
 
            achievedTargets = await Leads.countDocuments({
                customerStatus: "Licenser",
                licensorDate: { $gte: startDate.toISOString(), $lt: endDate.toISOString() }
            });
 
        } else if (role === "Region Manager") {
            const regionManager = await RegionManager.findOne({ user: userId }).select("region");
            if (!regionManager) return res.status(404).json({ error: "Region Manager record not found." });
 
            console.log("Region Manager ID:", regionManager._id);
            console.log("Region ID:", regionManager.region);
 
            // Fetch target where the regionManager's region matches the target collection
            const targetRecords = await Target.find({
                region: regionManager.region,
                targetType: "Region",
                month: { $regex: monthName, $options: "i" }
            });
 
            console.log("Fetched Targets:", targetRecords);
 
            totalTarget = targetRecords.reduce((acc, record) => acc + (record.target || 0), 0);
            console.log("Calculated Total Target:", totalTarget);
 
            leadsFilter = { regionId: regionManager.region, customerStatus: "Licenser", licensorDate: { $gte: startDate.toISOString(), $lt: endDate.toISOString() } };
 
        } else if (role === "Area Manager") {
            const areaManager = await AreaManager.findOne({ user: userId }).select("area");
            if (!areaManager) return res.status(404).json({ error: "Area Manager record not found." });
 
            console.log("Area Manager ID:", areaManager._id);
            console.log("Area ID:", areaManager.area);
 
            const targetRecords = await Target.find({
                area: areaManager.area,
                targetType: "Area",
                month: { $regex: monthName, $options: "i" }
            });
 
            console.log("Fetched Targets:", targetRecords);
 
            totalTarget = targetRecords.reduce((acc, record) => acc + (record.target || 0), 0);
            console.log("Calculated Total Target:", totalTarget);
 
            leadsFilter = { areaId: areaManager.area, customerStatus: "Licenser", licensorDate: { $gte: startDate.toISOString(), $lt: endDate.toISOString() } };
 
        } else if (role === "Bda") {
            const bda = await Bda.findOne({ user: userId }).select("_id");
            if (!bda) return res.status(404).json({ error: "BDA record not found." });
 
            console.log("BDA ID:", bda._id);
 
            const targetRecords = await Target.find({
                bda: bda._id,
                targetType: "Bda",
                month: { $regex: monthName, $options: "i" }
            });
 
            console.log("Fetched Targets:", targetRecords);
 
            totalTarget = targetRecords.reduce((acc, record) => acc + (record.target || 0), 0);
            console.log("Calculated Total Target:", totalTarget);
 
            leadsFilter = { bdaId: bda._id, customerStatus: "Licenser", licensorDate: { $gte: startDate.toISOString(), $lt: endDate.toISOString() } };
 
        } else {
            return res.status(403).json({ error: "Unauthorized role." });
        }
 
        console.log("Leads Filter:", leadsFilter);
 
        achievedTargets = await Leads.countDocuments(leadsFilter);
        console.log("Achieved Targets:", achievedTargets);
 
        const balanceTarget = totalTarget - achievedTargets;
 
        return res.status(200).json({
            message: "Achieved targets retrieved successfully",
            totalTarget,
            achievedTargets,
            balanceTarget
        });
 
    } catch (error) {
        console.error("Error fetching achieved targets:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

  exports.getYearlyTargets = async (req, res) => {
    try {
      const { year } = req.query;
      if (!year) {
        return res.status(400).json({ error: "Year is required as a query parameter." });
      }
      const numericYear = parseInt(year, 10);
      if (isNaN(numericYear)) {
        return res.status(400).json({ error: "Invalid year provided." });
      }
   
      // Define an array with full month names (you can adjust if needed)
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
   
   
      let results = [];
   
      for (let m = 0; m < 12; m++) {
   
        const startDate = new Date(numericYear, m, 1);
        const endDate = new Date(numericYear, m + 1, 1);
   
     
        const targetDocs = await Target.find({
          targetType: "Region",
          createdAt: { $gte: startDate, $lt: endDate }
        });
   
        const totalTarget = targetDocs.reduce((sum, doc) => sum + (doc.target || 0), 0);
   
   
        const achievedTargets = await Leads.countDocuments({
          customerStatus: "Licenser",
          licensorDate: { $gte: startDate.toISOString(), $lt: endDate.toISOString() }
        });
   
        // Compute balance target as totalTarget minus achievedTargets.
        const balanceTarget = totalTarget - achievedTargets;
   
        // Add the result for this month.
        results.push({
          month: monthNames[m],
          totalTarget,
          achievedTargets,
          balanceTarget
        });
      }
   
      return res.status(200).json({
        message: "Yearly targets retrieved successfully",
        data: results
      });
    } catch (error) {
      console.error("Error fetching yearly targets:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
   

  // Helper function to convert "YYYY-MM" to full month name (if needed)
  function convertMonth(queryMonth) {
    const monthMap = {
      "01": "January",
      "02": "February",
      "03": "March",
      "04": "April",
      "05": "May",
      "06": "June",
      "07": "July",
      "08": "August",
      "09": "September",
      "10": "October",
      "11": "November",
      "12": "December"
    };
 
    const parts = queryMonth.split("-");
    if (parts.length === 2) {
      const mm = parts[1];
      return monthMap[mm] || queryMonth;
    }
    return queryMonth;
  }



const ActivityLog = (req, status, operationId = null) => {
    const { id, userName } = req.user;
    const log = { id, userName, status };
  
    if (operationId) {
      log.operationId = operationId;
    }
  
    req.user = log;
  };