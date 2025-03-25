const Area = require('../database/model/area');
const Region = require('../database/model/region')
const Supervisor = require("../database/model/supervisor");
const SupportAgent = require("../database/model/supportAgent");
const AreaManager = require("../database/model/areaManager");
const RegionManager = require("../database/model/regionManager");
const Bda = require("../database/model/bda");
const User = require('../database/model/user');
const Leads = require("../database/model/leads")
const Ticket = require("../database/model/ticket");


exports.getSolvedTicketsByRegion = async (req, res) => {
  try {
    // Fetch all regions
    const regions = await Region.find();

    // Prepare an array to store the result
    const result = await Promise.all(
      regions.map(async (region) => {
        const solvedTicket = await Ticket.countDocuments({
          region: region._id,
          status: "Resolved",
        });

        return {
          _id: region._id,
          country: region.country,
          regionName: region.regionName,
          solvedTicket,
        };
      })
    );

    const sortedResult = result
      .sort((a, b) => b.solvedTicket - a.solvedTicket)
      .slice(0, 6);

    // Send response
    res.json(sortedResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




exports.getDocumentCounts = async (req, res) => {
    try {
      // Fetch counts for all collections in parallel
      const [
        totalArea,
        totalRegion,
        totalSupervisors,
        totalSupportAgents,
        totalAreaManagers,
        totalRegionManagers,
        totalBdas,
        totalUsers,
        totalTrial,
        totalLead,
        totalLicensor,
        activeLicensor,
        totalTickets,
        resolvedTickets
      ] = await Promise.all([
        Area.countDocuments(),
        Region.countDocuments(),
        Supervisor.countDocuments(),
        SupportAgent.countDocuments(),
        AreaManager.countDocuments(),
        RegionManager.countDocuments(),
        Bda.countDocuments(),
        User.countDocuments(),
        Leads.countDocuments({ customerStatus: "Trial" }),
        Leads.countDocuments({ customerStatus: "Lead" }),
        Leads.countDocuments({ customerStatus: "Licenser" }),
        Leads.countDocuments({ customerStatus: "Licenser",licensorStatus:"Active" }),
        Ticket.countDocuments(),
        Ticket.countDocuments({ status: "Resolved" }),
      ]);
  
      // Send response
      res.status(200).json({
        totalArea,
        totalRegion,
        totalSupervisors,
        totalSupportAgents,
        totalAreaManagers,
        totalRegionManagers,
        totalBdas,
        totalUsers,
        totalTrial,
        totalLead,
        totalLicensor,
        activeLicensor,
        totalTickets,
        resolvedTickets
      });
    } catch (error) {
      console.error("Error fetching document counts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  exports.getTeamCounts = async (req, res) => {
    try {
      const { id } = req.params;
  
      let filter = id ? { region: id } : {};
  
      // Count documents based on the filter (with or without region filter)
      const [regionManager, areaManager, bda, supervisor, supportAgent] = await Promise.all([
        RegionManager.countDocuments(filter),
        AreaManager.countDocuments(filter),
        Bda.countDocuments(filter),
        Supervisor.countDocuments(filter),
        SupportAgent.countDocuments(filter),
      ]);
  
      const totalTeam = regionManager + areaManager + bda + supervisor + supportAgent;
  
      // Send response
      res.json({
        regionId: id || "All Regions",
        regionManager,
        areaManager,
        bda,
        supervisor,
        supportAgent,
        totalTeam,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


exports.getLeadConversionRate = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Fetch areas under the given region ID
    const areas = await Area.find({ region: id });

    // Step 2: Calculate total and converted leads for each area
    const areasWithConversionRate = await Promise.all(
      areas.map(async (area) => {
        const areaId = area._id;

        // Total leads in this area
        const totalLeads = await Leads.countDocuments({ areaId });

        // Converted leads in this area (where customerStatus is not "Lead")
        const convertedLeads = await Leads.countDocuments({
          areaId,
          customerStatus: { $ne: 'Lead' },
        });

        // Calculate conversion rate
        const conversionRate = totalLeads > 0
          ? ((convertedLeads / totalLeads) * 100).toFixed(2)
          : 0;

        // Return the area details with conversion rate
        return {
          id: areaId,
          areaName: area.areaName,
          conversionRate: `${conversionRate}%`,
        };
      })
    );

    // Step 3: Calculate total and converted leads for the entire region
    const totalRegionLeads = await Leads.countDocuments({ regionId: id });
    const convertedRegionLeads = await Leads.countDocuments({
      regionId: id,
      customerStatus: { $ne: 'Lead' },
    });

    // Step 4: Calculate the overall region conversion rate
    const regionConversionRate = totalRegionLeads > 0
      ? ((convertedRegionLeads / totalRegionLeads) * 100).toFixed(2)
      : 0;

    // Step 5: Send the response
    res.json({
      regionId: id,
      regionConversionRate: `${regionConversionRate}%`,
      areas: areasWithConversionRate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.getCustomerStatusCounts = async (req, res) => {
  try {
      const { date } = req.query; // Get date from query params (e.g., ?date=2025/03/25)
      
      if (!date) {
          return res.status(400).json({ success: false, message: "Date is required" });
      }

      // Convert date string to start and end of the day (00:00:00 - 23:59:59)
      const startDate = new Date(date + "T00:00:00.000Z");
      const endDate = new Date(date + "T23:59:59.999Z");

      const statusCounts = await Leads.aggregate([
          {
              $match: {
                  createdAt: { $gte: startDate, $lte: endDate } // Filter based on createdAt
              }
          },
          {
              $group: {
                  _id: "$project",
                  Lead: { $sum: { $cond: [{ $eq: ["$customerStatus", "Lead"] }, 1, 0] } },
                  Trial: { $sum: { $cond: [{ $eq: ["$customerStatus", "Trial"] }, 1, 0] } },
                  Licenser: { $sum: { $cond: [{ $eq: ["$customerStatus", "Licenser"] }, 1, 0] } }
              }
          },
          {
              $project: {
                  _id: 0,
                  project: "$_id",
                  statuses: { Lead: "$Lead", Trial: "$Trial", Licenser: "$Licenser" }
              }
          }
      ]);

      res.status(200).json({ success: true, data: statusCounts });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};



exports.getProjectConversionRate = async (req, res) => {
  try {
      // Step 1: Get a list of all projects
      const projects = await Leads.distinct("project");

      // Step 2: Calculate conversion rate for each project
      const projectConversionRates = await Promise.all(
          projects.map(async (project) => {
              // Total leads in this project
              const totalLeads = await Leads.countDocuments({ project });

              // Converted leads (where customerStatus is NOT "Lead")
              const convertedLeads = await Leads.countDocuments({
                  project,
                  customerStatus: { $ne: "Lead" }
              });

              // Calculate conversion rate
              const conversionRate = totalLeads > 0 
                  ? ((convertedLeads / totalLeads) * 100).toFixed(2)
                  : 0;

              return {
                  project,
                  conversionRate: `${conversionRate}%`,
              };
          })
      );

      // Step 3: Send response with all projects and their conversion rates
      res.status(200).json({
          success: true,
          data: projectConversionRates
      });

  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};
