import mongoose, { Schema } from "mongoose";
const PermissionSchema = new Schema({
    name: { type: String, required: true, unique: true },
}, { timestamps: true });
const Permission = mongoose.model("Permission", PermissionSchema);
export default Permission;
