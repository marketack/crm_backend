import mongoose, { Schema } from "mongoose";
// ✅ Define Lead Schema
const LeadSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    source: { type: String, enum: ["LinkedIn", "Google Ads", "Referral", "Cold Call", "Other"], required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: ["new", "contacted", "proposal_sent", "closed_won", "closed_lost"],
        default: "new",
    },
    engagementScore: { type: Number, default: 50 },
    leadScore: { type: Number, default: 50 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
// ✅ Export Lead Model
export const Lead = mongoose.model("Lead", LeadSchema);
