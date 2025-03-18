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
  let query = ''
  let status = ''

  switch (role) {
    case "Region Manager": {
      const regionManager = await RegionManager.findOne({ user: userId }).select("_id status");
      if (!regionManager) throw new Error("Region Manager not found.");
      query = regionManager._id;
      status = regionManager.status
      break;
    }
    case "Area Manager": {
      const areaManager = await AreaManager.findOne({ user: userId }).select("_id status");
      if (!areaManager) throw new Error("Area Manager not found.");
      query = areaManager._id;
      status = areaManager.status
      break;
    }
    case "BDA": {
      const bda = await Bda.findOne({ user: userId }).select("_id status");
      if (!bda) throw new Error("BDA not found.");
      query = bda._id;
      status = bda.status
      break;
    }
    case "Supervisor": {
        const supervisor = await Supervisor.findOne({ user: userId }).select("_id status");
        if (!supervisor) throw new Error("Supervisor not found.");
        query = supervisor._id;
        status = supervisor.status
        break;
      }
      case "Support Agent": {
        const supportAgent = await SupportAgent.findOne({ user: userId }).select("region status");
        if (!supportAgent) throw new Error("Support Agent not found.");
        query = supportAgent._id;
        status = supportAgent.status
        break;
      }
    default:
      if (!["Super Admin", "Sales Admin","Support Admin"].includes(role)) {
        throw new Error("Unauthorized role.");
      }
  }

  return {query,status};
};

module.exports = filterByRole;
