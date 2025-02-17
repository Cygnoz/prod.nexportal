const mongoose = require("mongoose");
const { Schema } = mongoose;
 
const targetSchema = new Schema({
  region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
  area: { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
  bda: { type: mongoose.Schema.Types.ObjectId, ref: 'Bda' },
  month: { type: String },
  year:{type:String},
  target: { type: Number },
  targetType: { type: String },
  totalRegionTarget: { type: Number },
  totalAreaTarget: { type: Number },
  totalBdaTarget: { type: Number },
  regionManager: { type: mongoose.Schema.Types.ObjectId, ref: "RegionManager" },
  areaManager: { type: mongoose.Schema.Types.ObjectId, ref: "AreaManager" }
}, { timestamps: true });
 
const Target = mongoose.model("Target", targetSchema);
module.exports = Target;