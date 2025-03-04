import mongoose, { Document, Schema, Model, Types } from "mongoose";

// ✅ Define Service Interface
interface IService {
  title: string;
  description: string;
  price?: number;
  features: string[];  // List of features for the service
}

// ✅ Define Company Interface
export interface ICompany extends Document {
  name: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
  industry: string;
  aboutUs?: string;
  team: Types.ObjectId[];
  contactUs?: {
    email: string;
    phone: string;
    address?: string;
  };
  services: IService[];  // ✅ Now includes services
  blogPosts: Types.ObjectId[];
  newsletterSubscribers: Types.ObjectId[];
  subscriptionPlan: "free" | "premium" | "enterprise";
  subscriptionStatus: "active" | "expired" | "canceled";
  subscriptionExpiresAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
}

// ✅ Define Company Schema
const ServiceSchema = new Schema<IService>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  features: { type: [String], default: [] }, // ✅ List of features
});

const CompanySchema = new Schema<ICompany>(
  {
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
  },
  { timestamps: true }
);

// ✅ Create & Export Model
const Company: Model<ICompany> = mongoose.model<ICompany>("Company", CompanySchema);
export default Company;
