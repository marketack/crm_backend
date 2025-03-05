import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Transaction Interface
export interface ITransaction extends Document {
  user: Types.ObjectId;
  amount: number;
  currency: "USD" | "EUR" | "GBP" | "JOD" | "AED";
  paymentMethod: "credit_card" | "bank_transfer" | "paypal" | "crypto" | "cash";
  status: "pending" | "completed" | "failed" | "refunded";
  referenceId?: string;
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Transaction Schema
const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["USD", "EUR", "GBP", "JOD", "AED"], default: "USD" },

    paymentMethod: { type: String, enum: ["credit_card", "bank_transfer", "paypal", "crypto", "cash"], required: true },
    status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },

    referenceId: { type: String }, // External payment reference
    details: { type: String },

  },
  { timestamps: true }
);

// ✅ Export Transaction Model
export const Transaction: Model<ITransaction> = mongoose.model<ITransaction>("Transaction", TransactionSchema);
