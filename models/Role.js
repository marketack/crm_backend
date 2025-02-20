const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., "Admin"
    description: { type: String }, // Role description
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }], // List of permissions
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who created the role
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
