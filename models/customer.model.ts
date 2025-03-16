import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  company?: Types.ObjectId; // Store company as an ObjectId reference
  industry?: string;
  relationshipType: "prospect" | "customer" | "partner";
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  customerValue: number;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  leadSource?: string;
  lastContactDate?: Date;
  notes: string[];
  communicationHistory: {
    date: Date;
    method: "email" | "phone" | "meeting" | "chat";
    summary: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    company: { type: Schema.Types.ObjectId, ref: "Company" }, // References Company model
    industry: { type: String },
    relationshipType: {
      type: String,
      enum: ["prospect", "customer", "partner"],
      default: "prospect",
    },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
    website: { type: String },
    customerValue: { type: Number, default: 0 },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    leadSource: { type: String, default: "unknown" }, // Track where the lead came from
    lastContactDate: { type: Date },
    notes: { type: [String], default: [] },
    communicationHistory: [
      {
        date: { type: Date, required: true },
        method: { type: String, enum: ["email", "phone", "meeting", "chat"], required: true },
        summary: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Customer: Model<ICustomer> = mongoose.model<ICustomer>("Customer", CustomerSchema);
