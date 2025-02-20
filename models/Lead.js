const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String },
    status: {
      type: String,
      enum: ["New", "In Progress", "Closed"],
      default: "New",
    },
    source: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tags: [{ type: String }],
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
    leadValue: { type: Number },
    defaultLanguage: { type: String },
    description: { type: String },
    publicContactedToday: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
module.exports = Lead;
