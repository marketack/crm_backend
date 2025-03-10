import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Lead Interface
export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;
  position?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  leadValue: number;
  defaultLanguage: string;
  source: "LinkedIn" | "Google Ads" | "Referral" | "Cold Call" | "Other";
  assignedTo?: Types.ObjectId;
  status: "new" | "contacted" | "proposal_sent" | "closed_won" | "closed_lost";
  tags: string[];
  engagementScore: number;
  leadScore: number;
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
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
    website: { type: String },

    leadValue: { type: Number, default: 0 },
    defaultLanguage: { type: String, default: "English" },

    source: { type: String, enum: ["LinkedIn", "Google Ads", "Referral", "Cold Call", "Other"], required: true },

    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["new", "contacted", "proposal_sent", "closed_won", "closed_lost"],
      default: "new",
    },

    tags: { type: [String], default: [] },

    engagementScore: { type: Number, min: 0, max: 100, default: 50 },
    leadScore: { type: Number, min: 0, max: 100, default: 50 },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ✅ Export Lead Model
export const Lead: Model<ILead> = mongoose.model<ILead>("Lead", LeadSchema);
