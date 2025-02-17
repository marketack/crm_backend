const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  company: { type: String, required: true }, // ✅ Ensure this exists in the schema
  status: { type: String, enum: ["New", "In Progress", "Closed"], default: "New" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Make sure the user is stored
}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);
