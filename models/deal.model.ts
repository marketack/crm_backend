import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Deal Interface
export interface IDeal extends Document {
  title: string;
  description?: string;
  amount: number;
  stage: "lead" | "negotiation" | "proposal_sent" | "closed_won" | "closed_lost";
  assignedTo: Types.ObjectId;
  customer: Types.ObjectId;
  expectedCloseDate?: Date;
  createdBy: Types.ObjectId; // ✅ Fix: Added createdBy field
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Deal Schema
const DealSchema = new Schema<IDeal>(
  {
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    stage: { type: String, enum: ["lead", "negotiation", "proposal_sent", "closed_won", "closed_lost"], required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
    expectedCloseDate: { type: Date },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Fix: Added createdBy
  },
  { timestamps: true }
);

// ✅ Export Deal Model
export const Deal: Model<IDeal> = mongoose.model<IDeal>("Deal", DealSchema);
