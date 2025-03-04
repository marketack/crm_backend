import mongoose, { Document, Schema, Model, Types } from "mongoose";

// ✅ Define Subscription Interface
export interface ISubscription extends Document {
  user: Types.ObjectId;
  saasTool: Types.ObjectId;
  plan: "basic" | "premium" | "enterprise";
  status: "active" | "canceled" | "expired";
  startDate: Date;
  expiryDate: Date;
  price: number;
  billingCycle: "monthly" | "yearly";
  autoRenew: boolean;
  cancelDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
}

// ✅ Define Subscription Schema
const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Fixed Type
    saasTool: { type: Schema.Types.ObjectId, ref: "SaaSTool", required: true }, // ✅ Fixed Type

    plan: { type: String, enum: ["basic", "premium", "enterprise"], required: true },
    status: { type: String, enum: ["active", "canceled", "expired"], default: "active" },

    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },

    price: { type: Number, required: true },
    billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },

    autoRenew: { type: Boolean, default: true },
    cancelDate: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Middleware to Auto-Set Expiry Date
SubscriptionSchema.pre<ISubscription>("save", function (next) {
  if (!this.isModified("startDate") && !this.isModified("billingCycle")) return next();

  const duration = this.billingCycle === "monthly" ? 30 : 365;
  this.expiryDate = new Date(this.startDate);
  this.expiryDate.setDate(this.expiryDate.getDate() + duration);

  next();
});

// ✅ Method to Check Expiry Status
SubscriptionSchema.methods.isExpired = function (): boolean {
  return this.expiryDate < new Date();
};

// ✅ Export Subscription Model
const Subscription: Model<ISubscription> = mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
export default Subscription;
