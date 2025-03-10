import mongoose, { Schema } from "mongoose";
// ✅ Define Transaction Schema
const TransactionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["USD", "EUR", "GBP", "JOD", "AED"], default: "USD" },
    paymentMethod: { type: String, enum: ["credit_card", "bank_transfer", "paypal", "crypto", "cash"], required: true },
    status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
    referenceId: { type: String }, // External payment reference
    details: { type: String },
}, { timestamps: true });
// ✅ Export Transaction Model
export const Transaction = mongoose.model("Transaction", TransactionSchema);
