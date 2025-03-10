import mongoose, { Document, Schema, Model } from "mongoose";

/** ✅ Define Permission Interface */
export interface IPermission extends Document {
  name: string; // e.g., "manage_users"
  description: string; // e.g., "Allows managing users"
  createdAt: Date;
  updatedAt: Date;
}

/** ✅ Define Permission Schema */
const PermissionSchema = new Schema<IPermission>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

/** ✅ Create & Export Permission Model */
const Permission: Model<IPermission> = mongoose.model<IPermission>("Permission", PermissionSchema);
export default Permission;
