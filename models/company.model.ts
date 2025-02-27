import mongoose, { Document, Schema, Model } from "mongoose";

// ✅ Define Company Interface
export interface ICompany extends Document {
  name: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
  industry: string;
  owner: mongoose.Schema.Types.ObjectId; // ✅ Fixed owner type
  staff: mongoose.Schema.Types.ObjectId[]; // ✅ Fixed staff type
  subscriptionPlan: "free" | "premium" | "enterprise";
  subscriptionStatus: "active" | "expired" | "canceled";
  subscriptionExpiresAt?: Date;
  autoRenewSubscription: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Company Schema
const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    website: { type: String },
    industry: { type: String, required: true },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, // ✅ Fixed owner type
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ Fixed staff type

    subscriptionPlan: { type: String, enum: ["free", "premium", "enterprise"], default: "free" },
    subscriptionStatus: { type: String, enum: ["active", "expired", "canceled"], default: "active" },
    subscriptionExpiresAt: { type: Date },
    autoRenewSubscription: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Create & Export Model
const Company: Model<ICompany> = mongoose.model<ICompany>("Company", CompanySchema);
export default Company;
