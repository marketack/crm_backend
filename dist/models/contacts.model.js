import mongoose, { Schema } from "mongoose";
// ✅ Define Contact Schema
const ContactSchema = new Schema({
    name: { type: String, required: true },
    company: { type: String },
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, required: true },
    type: { type: String, enum: ["lead", "customer", "partner"], required: true },
    status: {
        type: String,
        enum: ["new", "contacted", "qualified", "proposal_sent", "closed", "active", "inactive"],
        default: "new"
    },
    source: { type: String, enum: ["Facebook", "LinkedIn", "Google Ads", "Referral", "Other"], required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    tags: [{ type: String }], // User-defined tags
    // ✅ Address Fields
    billingAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String }
    },
    shippingAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String }
    },
    // ✅ CRM & AI Scoring
    totalRevenue: { type: Number, default: 0 },
    leadScore: { type: Number, default: 50 }, // AI-powered conversion score
    aiInsights: {
        engagementScore: { type: Number, default: 50 },
        predictedNeeds: [{ type: String }],
        riskFactor: { type: Number, default: 0 },
    },
    // ✅ Linked Messages & History
    whatsappMessages: [{ type: Schema.Types.ObjectId, ref: "WhatsAppMessage" }], // Linked WhatsApp chat
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Fix: Added createdBy
}, { timestamps: true });
// ✅ Export Contact Model as a Named Export
export const Contact = mongoose.model("Contact", ContactSchema);
