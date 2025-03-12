import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Lead Interface
export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;
  position?: string;
  company?: string;
  industry?: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  leadValue: number;
  defaultLanguage: string;
  source: "LinkedIn" | "Google Ads" | "Referral" | "Cold Call" | "Other";
  sourceDetails?: string; // Extra field for tracking source details (e.g., campaign name)
  assignedTo?: Types.ObjectId;
  status: "new" | "contacted" | "proposal_sent" | "closed_won" | "closed_lost";
  nextFollowUp?: Date;
  tags: string[];
  engagementScore: number;
  leadScore: number;
  activityLog: {
    date: Date;
    activity: string;
    performedBy: Types.ObjectId;
  }[];
  leadStageHistory: {
    date: Date;
    stage: string;
    updatedBy: Types.ObjectId;
  }[];
  notes: {
    date: Date;
    content: string;
    addedBy: Types.ObjectId;
  }[];
  attachments: {
    filename: string;
    url: string;
    uploadedBy: Types.ObjectId;
    uploadedAt: Date;
  }[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Lead Schema
const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    position: { type: String },
    company: { type: String },
    industry: { type: String }, // ✅ Added Industry Type
    description: { type: String }, // ✅ Added Description
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" }, // ✅ Priority Level

    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
    website: { type: String },

    leadValue: { type: Number, default: 0 },
    defaultLanguage: { type: String, default: "English" },

    source: { type: String, enum: ["LinkedIn", "Google Ads", "Referral", "Cold Call", "Other"], required: true },
    sourceDetails: { type: String }, // ✅ Added Source Details (e.g., "Campaign XYZ")

    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["new", "contacted", "proposal_sent", "closed_won", "closed_lost"],
      default: "new",
    },

    nextFollowUp: { type: Date }, // ✅ Added Next Follow-Up Date

    tags: { type: [String], default: [] },

    engagementScore: { type: Number, min: 0, max: 100, default: 50 },
    leadScore: { type: Number, min: 0, max: 100, default: 50 },

    activityLog: [
      {
        date: { type: Date, default: Date.now },
        activity: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ], // ✅ Added Activity Log

    leadStageHistory: [
      {
        date: { type: Date, default: Date.now },
        stage: { type: String, required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ], // ✅ Added Lead Stage Progression

    notes: [
      {
        date: { type: Date, default: Date.now },
        content: { type: String, required: true },
        addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ], // ✅ Added Notes Section

    attachments: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ], // ✅ Added Attachments (Files, Docs)

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ✅ Export Lead Model
export const Lead: Model<ILead> = mongoose.model<ILead>("Lead", LeadSchema);
