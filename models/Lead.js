const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ["new", "contacted", "qualified", "converted", "lost"], default: "new" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to User
  createdAt: { type: Date, default: Date.now },
});

const Lead = mongoose.model("Lead", leadSchema);
module.exports = Lead;
