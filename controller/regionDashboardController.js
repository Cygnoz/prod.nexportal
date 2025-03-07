const Region = require("../database/model/region");
const Area = require("../database/model/area");
const AreaManager = require("../database/model/areaManager");
const Bda = require("../database/model/bda");
const Leads = require("../database/model/leads");
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;

 
// Controller function to get all areas under a region
exports.getAreasByRegion = async (req, res) => {
    try {
      const { regionId } = req.params;
  
      // Check if the region exists
      const region = await Region.findById(regionId);
      if (!region) {
        return res.status(404).json({ message: "Region not found" });
      }
  
      // Find all areas under the region
      const areas = await Area.find({ region: regionId });
  
      // If no areas are found
      if (areas.length === 0) {
        return res.status(404).json({ message: "No areas found for this region" });
      }
  
      res.status(200).json({ region, areas });
    } catch (error) {
      console.error("Error fetching areas by region:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };



// // Controller function to get top-performing Area Managers and BDAs by region
// exports.getTopPerformersByRegion = async (req, res) => {
//   try {
//     const { regionId } = req.params;

//     // Check if the region exists
//     const region = await Region.findById(regionId);
//     if (!region) {
//       return res.status(404).json({ message: "Region not found" });
//     }

//     // Get Area Managers under the region
//     const areaManagers = await AreaManager.find({ region: regionId }).populate('user', 'userImage userName');
    
//     // Get BDAs under the region
//     const bdas = await Bda.find({ region: regionId }).populate('user', 'userImage userName');

//     // Calculate lead conversion rate for Area Managers
//     const areaManagerPerformers = await Promise.all(
//       areaManagers.map(async (manager) => {
//         const totalLeads = await Leads.countDocuments({ areaManager: manager._id });
//         const convertedLeads = await Leads.countDocuments({
//           areaManager: manager._id,
//           customerStatus: { $ne: "Lead" },
//         });

//         const conversionRate = totalLeads === 0 ? 0 : ((convertedLeads / totalLeads) * 100).toFixed(2);

//         return {
//           _id: manager._id,
//           userImage: manager.user?.userImage || "",
//           userName: manager.user?.userName || "Unknown",
//           conversionRate: `${conversionRate}%`,
//         };
//       })
//     );

//     // Calculate lead conversion rate for BDAs
//     const bdaPerformers = await Promise.all(
//       bdas.map(async (bda) => {
//         const totalLeads = await Leads.countDocuments({ bdaId: bda._id });
//         const convertedLeads = await Leads.countDocuments({
//           bdaId: bda._id,
//           customerStatus: { $ne: "Lead" },
//         });

//         const conversionRate = totalLeads === 0 ? 0 : ((convertedLeads / totalLeads) * 100).toFixed(2);

//         return {
//           _id: bda._id,
//           userImage: bda.user?.userImage || "",
//           userName: bda.user?.userName || "Unknown",
//           conversionRate: `${conversionRate}%`,
//         };
//       })
//     );

//     // Return the response
//     res.status(200).json({
//       region: region.name,
//       areaManagers: areaManagerPerformers,
//       bdas: bdaPerformers,
//     });
//   } catch (error) {
//     console.error("Error fetching top performers by region:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };



// Controller function to get top-performing Area Managers and BDAs by region
exports.getTopPerformersByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;

    // Check if the region exists
    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }

    // Get Area Managers under the region
    const areaManagers = await AreaManager.find({ region: regionId }).populate("user", "userImage userName");

    // Get BDAs under the region
    const bdas = await Bda.find({ region: regionId }).populate("user", "userImage userName");

    // Helper function to calculate lead conversion rate
    const calculateConversionRate = async (collection, idField, id) => {
      const totalLeads = await Leads.countDocuments({ [idField]: id });
      const convertedLeads = await Leads.countDocuments({ [idField]: id, customerStatus: { $ne: "Lead" } });
      return totalLeads === 0 ? 0 : ((convertedLeads / totalLeads) * 100).toFixed(2);
    };

    // Calculate lead conversion rate for Area Managers
    let areaManagerPerformers = await Promise.all(
      areaManagers.map(async (manager) => {
        const conversionRate = await calculateConversionRate(Leads, "areaManager", manager._id);
        return {
          _id: manager._id,
          userImage: manager.user?.userImage || "",
          userName: manager.user?.userName || "Unknown",
          conversionRate: parseFloat(conversionRate),
        };
      })
    );

    // Sort by conversion rate in descending order and limit to top 10
    areaManagerPerformers = areaManagerPerformers
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 10);

    // Calculate lead conversion rate for BDAs
    let bdaPerformers = await Promise.all(
      bdas.map(async (bda) => {
        const conversionRate = await calculateConversionRate(Leads, "bdaId", bda._id);
        return {
          _id: bda._id,
          userImage: bda.user?.userImage || "",
          userName: bda.user?.userName || "Unknown",
          conversionRate: parseFloat(conversionRate),
        };
      })
    );

    // Sort by conversion rate in descending order and limit to top 10
    bdaPerformers = bdaPerformers
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 10);

    // Return the response
    res.status(200).json({
      region: region.name,
      areaManagers: areaManagerPerformers,
      bdas: bdaPerformers,
    });
  } catch (error) {
    console.error("Error fetching top performers by region:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

  
exports.getPerformanceByArea = async (req, res) => {
  try {
    const { regionId } = req.params;
 
    // Find all areas under the given region
    const areas = await Area.find({ region: regionId }).select("_id areaName");
    if (!areas.length) {
      return res.status(404).json({ message: "No areas found for this region." });
    }
 
    const areaIds = areas.map(area => area._id);
 
    // Aggregate Leads to count Licensers per area
    const leadData = await Leads.aggregate([
      { $match: { areaId: { $in: areaIds }, customerStatus: "Licenser" } },
      {
        $group: {
          _id: "$areaId",
          licenserCount: { $sum: 1 }
        }
      }
    ]);
 
    // Fetch Area Managers and populate the user fields (like userName)
    const areaManagers = await AreaManager.find({ area: { $in: areaIds } })
      .populate('user', 'userName')  // Populating userName and userImage from User collection
      .lean();
 
    const areaManagerMap = Object.fromEntries(
      areaManagers.map(manager => [String(manager.area), manager.user])  // Storing populated user data
    );
 
    const response = areas.map(area => {
      const leadInfo = leadData.find(ld => String(ld._id) === String(area._id)) || {};
      return {
        areaId: area._id,
        areaName: area.areaName,
        areaManager: areaManagerMap[String(area._id)] || null,  // Area Manager now includes user details
        licenserCount: leadInfo.licenserCount || 0
      };
    });
 
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
 


exports.getLeadSourceGraph = async (req, res) => {
  try {
    const { regionId } = req.params;
    const { date } = req.query; // Expecting full date like "2025-02-14"
 
    if (!regionId) {
      return res.status(400).json({ error: "regionId is required as a URL parameter." });
    }
 
    if (!ObjectId.isValid(regionId)) {
      return res.status(400).json({ error: "Invalid regionId format." });
    }
 
    if (!date) {
      return res.status(400).json({ error: "Date query parameter is required." });
    }
 
    // Extract only the year and month from the date (YYYY-MM-DD → YYYY-MM)
    const [year, month] = date.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1); // First day of the given month
    const endDate = new Date(year, month, 1); // First day of the next month
 
    const regionObjectId = new ObjectId(regionId);
 
    // Aggregation pipeline to filter by regionId and date range, then group by leadSource
    const graphData = await Leads.aggregate([
      {
        $match: {
          regionId: regionObjectId,
          createdAt: { $gte: startDate, $lt: endDate } // Filter by month
        }
      },
      {
        $group: {
          _id: "$leadSource",
          count: { $sum: 1 }
        }
      }
    ]);
 
    // Default structure with zero counts
    const result = {
      "Social Media": 0,
      "Website": 0,
      "Refferal": 0,
      "Events": 0
    };
 
    // Populate result with actual data
    graphData.forEach(item => {
      if (result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
      }
    });

    return res.status(200).json({
      message: "Lead source graph data retrieved successfully",
      date: `${year}-${month.toString().padStart(2, "0")}`, // Ensuring YYYY-MM format in response
      data: result
    });
  } catch (error) {
    console.error("Error retrieving lead source graph data:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
 




exports.getConversionRate = async (req, res) => {
  try {
      const { regionId } = req.params;
      let { date } = req.query;

      if (!date || !/\d{4}-\d{2}/.test(date)) {
          return res.status(400).json({ message: "Date is required in YYYY-MM format." });
      }

      const startDate = new Date(`${date}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setUTCMonth(startDate.getUTCMonth() + 1);
      endDate.setUTCDate(0); // Last day of the month
      endDate.setUTCHours(23, 59, 59, 999);

      const mongoose = require("mongoose");
      const regionObjectId = new mongoose.Types.ObjectId(regionId);

      // Fetch areas with correct field name
      const areas = await Area.find({ region: regionObjectId }).select("_id areaName");
      
      if (areas.length === 0) {
          return res.status(404).json({ message: "No areas found under this region." });
      }

      const conversions = await Leads.aggregate([
          {
              $match: {
                  areaId: { $in: areas.map(a => a._id) },
                  customerStatus: { $in: ["Licenser", "Trial"] },
                  createdAt: { $gte: startDate, $lte: endDate }
              }
          },
          {
              $group: {
                  _id: { areaId: "$areaId", date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
                  conversionCount: { $sum: 1 }
              }
          }
      ]);

      const predefinedDates = [
          "05", "10", "15", "20", "25", "28"
      ].map(day => `${date}-${day}`);

      let trialConvertedOverTime = {};

      areas.forEach(area => {
          trialConvertedOverTime[area.areaName] = predefinedDates.map(entry => ({
              date: entry,
              conversionCount: conversions.find(c =>
                  c._id.areaId.toString() === area._id.toString() && c._id.date === entry
              )?.conversionCount || 0
          }));
      });

      res.json({ trialConvertedOverTime });
  } catch (error) {
      console.error("Error fetching conversion rates:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};


// exports.getConversionRate = async (req, res) => {
//   try {
//       const { regionId } = req.params;
//       let { date } = req.query;
 
//       if (!date) {
//           return res.status(400).json({ message: "Date is required in YYYY-MM-DD format." });
//       }
 
//       const endDate = new Date(date);
//       endDate.setUTCHours(23, 59, 59, 999);
 
//       const mongoose = require("mongoose");
//       const regionObjectId = new mongoose.Types.ObjectId(regionId);
 
//       // Fetch areas with correct field name
//       const areas = await Area.find({ region: regionObjectId }).select("_id areaName");
     
//       console.log("Fetched areas:", areas); // Debugging log
 
//       if (areas.length === 0) {
//           return res.status(404).json({ message: "No areas found under this region." });
//       }
//       const conversions = await Leads.aggregate([
//         {
//             $match: {
//                 areaId: { $in: areas.map(a => a._id) },
//                 customerStatus: { $in: ["Licenser", "Trial"] }, // Include both Trial & Licenser
//                 createdAt: { $lte: endDate }
//             }
//         },
//         {
//             $group: {
//                 _id: { areaId: "$areaId", date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
//                 conversionCount: { $sum: 1 }
//             }
//         }
//     ]);
   
//       let trialConvertedOverTime = {};
 
//       areas.forEach(area => {
//           trialConvertedOverTime[area.areaName] = [
//               { date: "2025-02-05", conversionCount: 0 },
//               { date: "2025-02-10", conversionCount: 0 },
//               { date: "2025-02-15", conversionCount: 0 },
//               { date: "2025-02-20", conversionCount: 0 },
//               { date: "2025-02-25", conversionCount: 0 },
//               { date: "2025-02-28", conversionCount: 0 }
//           ]
//           .filter(entry => new Date(entry.date) <= endDate)
//           .map(entry => ({
//               date: entry.date,
//               conversionCount: conversions.find(c =>
//                   c._id.areaId.toString() === area._id.toString() && c._id.date === entry.date
//               )?.conversionCount || 0
//           }));
//       });
 
//       res.json({ trialConvertedOverTime });
 
//   } catch (error) {
//       console.error("Error fetching conversion rates:", error);
//       res.status(500).json({ message: "Internal server error" });
//   }
// };
