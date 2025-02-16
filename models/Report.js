const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Report Creator
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
