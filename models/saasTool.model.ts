import mongoose, { Schema, Document } from "mongoose";

export interface ISaaSTool extends Document {
  name: string;
  description: string;
  price: number;
  url: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const SaaSToolSchema = new Schema<ISaaSTool>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    url: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISaaSTool>("SaaSTool", SaaSToolSchema);
