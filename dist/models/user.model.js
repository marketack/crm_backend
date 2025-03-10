var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
// ✅ Define User Schema
const UserSchema = new Schema({
    name: { type: String, required: true },
    position: { type: String, default: "Member" },
    email: { type: String, required: true, unique: true, index: true },
    emailVerified: { type: Boolean, default: false },
    phone: { type: String, required: true, unique: true, index: true },
    phoneVerified: { type: Boolean, default: false },
    password: { type: String, required: true, select: false },
    company: { type: Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    roles: [{ type: Schema.Types.ObjectId, ref: "Role" }], // ✅ References Role model
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
    profileImage: { type: String, default: "default.png" },
    status: { type: String, enum: ["active", "inactive", "suspended", "banned"], default: "active", index: true },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    walletBalance: { type: Number, default: 0, min: 0 },
    transactions: [
        {
            type: { type: String, enum: ["deposit", "withdrawal", "course_purchase"], required: true },
            amount: { type: Number, required: true },
            date: { type: Date, default: Date.now },
            status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
        },
    ],
    notifications: [
        {
            message: { type: String, required: true },
            type: { type: String, enum: ["info", "warning", "success", "error"], default: "info" },
            isRead: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    messages: [
        {
            sender: { type: Schema.Types.ObjectId, ref: "User" },
            content: { type: String, required: true },
            date: { type: Date, default: Date.now },
        },
    ],
    loginHistory: [
        {
            ip: { type: String },
            device: { type: String },
            location: { type: String },
            date: { type: Date, default: Date.now },
        },
    ],
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    subscriptionPlan: { type: String, enum: ["free", "premium", "enterprise"], default: "free" },
    subscriptionStatus: { type: String, enum: ["active", "expired", "canceled"], default: "active", index: true },
    subscriptionExpiresAt: { type: Date },
    agreedToTerms: { type: Boolean, default: false },
    timezone: { type: String, default: "UTC" },
    preferredLanguage: { type: String, default: "en" },
}, { timestamps: true });
// ✅ Virtual Field: Full Name
UserSchema.virtual("permissions", {
    ref: "Role",
    localField: "roles",
    foreignField: "_id",
    justOne: false,
    options: { select: "permissions" },
});
// 🔐 **Hash password before saving**
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        const saltRounds = 12;
        this.password = yield bcrypt.hash(this.password, saltRounds);
        next();
    });
});
// 🔄 **Compare Passwords**
UserSchema.methods.comparePassword = function (enteredPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt.compare(enteredPassword, this.password);
    });
};
// ✅ Ensure `permissions` are always populated correctly
UserSchema.pre(/^find/, function (next) {
    this
        .populate({ path: "roles", select: "name" }) // ✅ Ensure only relevant fields are populated
        .populate({ path: "permissions", select: "name" });
    next();
});
// ✅ Create & Export Model
const User = mongoose.model("User", UserSchema);
export default User;
