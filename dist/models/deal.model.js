import mongoose, { Schema } from "mongoose";
// ✅ Define Deal Schema
const DealSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    stage: { type: String, enum: ["lead", "negotiation", "proposal_sent", "closed_won", "closed_lost"], required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
    expectedCloseDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Fix: Added createdBy
}, { timestamps: true });
// ✅ Export Deal Model
export const Deal = mongoose.model("Deal", DealSchema);
