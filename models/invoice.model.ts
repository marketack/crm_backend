import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Payment Interface
interface IPayment {
  date: Date;
  amount: number;
  method: "credit_card" | "bank_transfer" | "paypal" | "cash" | "crypto";
  transactionId?: string;
}

// ✅ Define Tax Interface
interface ITax {
  name: string;
  rate: number; // Percentage (e.g., 10% tax stored as 10)
  amount: number; // Calculated tax amount
}

// ✅ Define Discount Interface
interface IDiscount {
  type: "percentage" | "fixed";
  value: number;
}

// ✅ Define Invoice Interface
export interface IInvoice extends Document {
  invoiceNumber: string;
  customer: Types.ObjectId;
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  taxes?: ITax[];
  totalAmount: number;
  discount?: IDiscount;
  amountPaid: number;
  balanceDue: number;
  dueDate: Date;
  status: "pending" | "paid" | "overdue" | "partially_paid";
  currency: "USD" | "EUR" | "GBP" | "AED" | "JOD";
  payments: IPayment[];
  notes?: string;
  terms?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Invoice Schema
const InvoiceSchema = new Schema<IInvoice>(
  {
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
  },
  { timestamps: true }
);

// ✅ Middleware to Auto-Update `balanceDue` and `status`
InvoiceSchema.pre<IInvoice>("save", function (next) {
  this.balanceDue = this.totalAmount - this.amountPaid;

  if (this.balanceDue === 0) {
    this.status = "paid";
  } else if (this.amountPaid > 0) {
    this.status = "partially_paid";
  } else if (new Date(this.dueDate) < new Date()) {
    this.status = "overdue";
  } else {
    this.status = "pending";
  }

  next();
});

// ✅ Export Invoice Model
export const Invoice: Model<IInvoice> = mongoose.model<IInvoice>("Invoice", InvoiceSchema);
