import { Schema, model } from "mongoose";
const activityLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
});
export default model("ActivityLog", activityLogSchema);
