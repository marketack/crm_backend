import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending" },
  dueDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ["credit_card", "paypal", "bank_transfer", "cash"], required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", InvoiceSchema);
export default Invoice;
