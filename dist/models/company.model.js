import mongoose, { Schema } from "mongoose";
// ✅ Define Company Schema
const ServiceSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    features: { type: [String], default: [] }, // ✅ List of features
});
const CompanySchema = new Schema({
    name: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    website: { type: String },
    industry: { type: String, required: true },
    aboutUs: { type: String, required: true, default: "" }, // ✅ Ensure this exists
    team: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    contactUs: {
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String },
    },
    services: { type: [ServiceSchema], default: [] }, // ✅ Services stored in the company document
    blogPosts: [{ type: Schema.Types.ObjectId, ref: "Blog", default: [] }],
    newsletterSubscribers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    subscriptionPlan: { type: String, enum: ["free", "premium", "enterprise"], default: "free" },
    subscriptionStatus: { type: String, enum: ["active", "expired", "canceled"], default: "active" },
    subscriptionExpiresAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
// ✅ Create & Export Model
const Company = mongoose.model("Company", CompanySchema);
export default Company;
