const mongoose = require('mongoose');

const LegalAndSecuritySchema = new mongoose.Schema({
  title: {type: String},
  selectOrder: {type: String},
  description: {type: String},
  legalAndSecurityType: {type: String},

});

module.exports = mongoose.model('LegalAndSecurity', LegalAndSecuritySchema);
