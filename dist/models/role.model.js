import mongoose, { Schema } from "mongoose";
const RoleSchema = new Schema({
    name: { type: String, required: true, unique: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }], // ✅ Link to permissions
}, { timestamps: true });
const Role = mongoose.model("Role", RoleSchema);
export default Role;
