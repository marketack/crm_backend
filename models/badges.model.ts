import mongoose, { Schema, Document, Model } from "mongoose";

// ✅ Define Badge Interface
export interface IBadge extends Document {
  name: string;
  description?: string;
  iconUrl?: string;
  criteria: string;
  createdAt: Date;
}

// ✅ Define Badge Schema
const BadgeSchema = new Schema<IBadge>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    iconUrl: { type: String },
    criteria: { type: String, required: true }, // e.g. "Completed 10 courses"
  },
  { timestamps: true }
);

// ✅ Export Named Model
export const Badge: Model<IBadge> = mongoose.model<IBadge>("Badge", BadgeSchema);
