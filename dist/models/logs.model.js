import mongoose, { Schema } from "mongoose";
// ✅ Define Log Schema
const LogSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., "LOGIN", "CREATE_INVOICE"
    details: { type: String }, // Optional details about the action
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });
// ✅ Auto-delete logs older than 30 days
LogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 days in seconds
// ✅ Export Log Model
export const Log = mongoose.model("Log", LogSchema);
