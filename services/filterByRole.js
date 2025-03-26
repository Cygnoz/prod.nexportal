const User = require("../database/model/user");
const AreaManager = require("../database/model/areaManager");
const RegionManager = require("../database/model/regionManager");
const Bda = require('../database/model/bda')
const SupportAgent = require('../database/model/supportAgent'); 
const Supervisor = require("../database/model/supervisor");


const filterByRole = async (userId) => {
  const user = await User.findById(userId).select("role");
  if (!user) throw new Error("User not found.");

  const { role } = user;
  const query = {};

  switch (role) {
    case "Region Manager": {
      const regionManager = await RegionManager.findOne({ user: userId }).select("_id");
      if (!regionManager) throw new Error("Region Manager not found.");
      query.regionManager = regionManager._id;
      break;
    }
    case "Area Manager": {
      const areaManager = await AreaManager.findOne({ user: userId }).select("_id");
      if (!areaManager) throw new Error("Area Manager not found.");
      query.areaManager = areaManager._id;
      break;
    }
    case "BDA": {
      const bda = await Bda.findOne({ user: userId }).select("_id");
      if (!bda) throw new Error("BDA not found.");
      query.bdaId = bda._id;
      break;
    }
    case "Supervisor": {
        const supervisor = await Supervisor.findOne({ user: userId }).select(" region");
        if (!supervisor) throw new Error("Supervisor not found.");
        query.regionId = supervisor.region;
        break;
      }
      case "Support Agent": {
        const supportAgent = await SupportAgent.findOne({ user: userId }).select("region");
        if (!supportAgent) throw new Error("Support Agent not found.");
        query.regionId = supportAgent.region;
        break;
      }
    default:
      if (!["Super Admin", "Sales Admin","Support Admin","Author"].includes(role)) {
        throw new Error("Unauthorized role.");
      }
  }

  return query;
};

module.exports = filterByRole;
