import mongoose, { Schema } from "mongoose";
// ✅ Define Invoice Schema
const InvoiceSchema = new Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [
        {
            description: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true },
        },
    ],
    subtotal: { type: Number, required: true },
    taxes: [
        {
            name: { type: String, required: true },
            rate: { type: Number, required: true },
            amount: { type: Number, required: true },
        },
    ],
    discount: {
        type: {
            type: String,
            enum: ["percentage", "fixed"],
            required: false,
        },
        value: { type: Number, required: false },
    },
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "paid", "overdue", "partially_paid"],
        default: "pending"
    },
    dueDate: { type: Date, required: true },
    currency: {
        type: String,
        enum: ["USD", "EUR", "GBP", "AED", "JOD"],
        default: "USD"
    },
    payments: [
        {
            date: { type: Date, required: true },
            amount: { type: Number, required: true },
            method: { type: String, enum: ["credit_card", "bank_transfer", "paypal", "cash", "crypto"], required: true },
            transactionId: { type: String },
        },
    ],
    notes: { type: String },
    terms: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
// ✅ Middleware to Auto-Update `balanceDue` and `status`
InvoiceSchema.pre("save", function (next) {
    this.balanceDue = this.totalAmount - this.amountPaid;
    if (this.balanceDue === 0) {
        this.status = "paid";
    }
    else if (this.amountPaid > 0) {
        this.status = "partially_paid";
    }
    else if (new Date(this.dueDate) < new Date()) {
        this.status = "overdue";
    }
    else {
        this.status = "pending";
    }
    next();
});
// ✅ Export Invoice Model
export const Invoice = mongoose.model("Invoice", InvoiceSchema);
