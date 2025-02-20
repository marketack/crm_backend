const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., "create_lead"
    description: { type: String, required: true }, // More details about permission
    category: { type: String, required: true }, // e.g., "Leads Management"
  },
  { timestamps: true }
);

const Permission = mongoose.model("Permission", permissionSchema);
module.exports = Permission;
