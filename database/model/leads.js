// v1.0

const mongoose = require("mongoose");
const { Schema } = mongoose;

const leadSchema = new Schema({

  regionId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Region'},
  areaId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Area'},
  bdaId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Bda'},
  customerId:{type:String},
  image:{ type: String },
  salutation :{ type: String },
  firstName: { type: String },
  lastName: { type: String },
  fullName: { type: String },
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  leadSource: { type: String },
  regionManager: { type: mongoose.Schema.Types.ObjectId, ref: "RegionManager" },
  areaManager: { type: mongoose.Schema.Types.ObjectId, ref: "AreaManager" },
  address: { type: String },
  city:{ type: String },
  state: { type: String },
  country : {type : String},
  // licenseType: { type: String },

  startDate: { type: String },
  endDate:{ type: String },
  duration:{type:String},
  licensorDate:{type:String},
  renewalDate:{type:String},
  trialDate:{type:String},

  companyId: { type: String },
  companyName: { type: String },
  companyPhone: { type: String },
  companyAddress: { type: String },
  pinCode: { type: String },

  licensorStatus:{ type: String },
  leadStatus:{ type: String },
  trialStatus:{type:String},
  customerStatus:{ type: String },

  
  organizationId:{ type: String },
  organizationName:{ type: String }

},
  { timestamps: true } 
);

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
