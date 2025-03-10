import mongoose, { Schema } from "mongoose";
// ✅ Define Subscription Schema
const SubscriptionSchema = new Schema({
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
}, { timestamps: true });
// ✅ Middleware to Auto-Set Expiry Date
SubscriptionSchema.pre("save", function (next) {
    if (!this.isModified("startDate") && !this.isModified("billingCycle"))
        return next();
    const duration = this.billingCycle === "monthly" ? 30 : 365;
    this.expiryDate = new Date(this.startDate);
    this.expiryDate.setDate(this.expiryDate.getDate() + duration);
    next();
});
// ✅ Method to Check Expiry Status
SubscriptionSchema.methods.isExpired = function () {
    return this.expiryDate < new Date();
};
// ✅ Export Subscription Model
const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;
