// v1.0



const mongoose = require("mongoose");
const { Schema } = mongoose;

const ticketSchema = new Schema(
  {
    ticketId: { type: String },
    resolutionTime: { type: String },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    region: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor' },
    supportAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportAgent' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String },
    type: { type: String },
    status: { type: String, default: "Open" },
    notes: { type: String },
    openingDate: { type: String },
    uploads: [{ type: String }], // Array for file URLs
    choice: [{ type: Map, of: String }], // Array of key-value pairs for module
    text: [{ type: Map, of: String }] // Array of key-value pairs for text
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
