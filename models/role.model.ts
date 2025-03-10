import mongoose, { Document, Schema, Model, Types } from "mongoose";

/** ✅ Define Role Interface */
export interface IRole extends Document {
  name: string; // e.g., "admin", "manager", "employee"
  permissions: string[]; // e.g., ["manage_users", "edit_content"]
  createdAt: Date;
  updatedAt: Date;
}

/** ✅ Define Role Schema */
const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    permissions: [{ type: String, required: true }],
  },
  { timestamps: true }
);

/** ✅ Register & Export Role Model */
const Role: Model<IRole> = mongoose.model<IRole>("Role", RoleSchema);
export default Role;
