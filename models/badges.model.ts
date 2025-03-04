import mongoose, { Document, Schema, Model } from "mongoose";

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // URL or local image path
  },
  { timestamps: true }
);

const Badge: Model<IBadge> = mongoose.model<IBadge>("Badge", BadgeSchema);
export default Badge;
