import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  permissions: [{ type: String, required: true }], // Example: ["create_user", "delete_invoice"]
  createdAt: { type: Date, default: Date.now },
});

const Role = mongoose.model("Role", RoleSchema);
export default Role;
