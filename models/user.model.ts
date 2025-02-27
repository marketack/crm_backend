import mongoose, { Document, Schema, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

// ✅ Sub-Schema Interfaces
interface ITransaction {
  type: "deposit" | "withdrawal" | "course_purchase";
  amount: number;
  date: Date;
  status: "pending" | "completed" | "failed";
}

interface INotification {
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: Date;
}

interface IMessage {
  sender: Types.ObjectId;
  content: string;
  date: Date;
}

interface ILoginHistory {
  ip: string;
  device: string;
  location: string;
  date: Date;
}

interface IActivity {
  type: "login" | "update_profile" | "new_connection";
  date: Date;
  details: string;
}

// ✅ Define User Interface
export interface IUser extends Document {
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  password: string;
  roles: Types.ObjectId[];
  company?: mongoose.Schema.Types.ObjectId;
  profileImage?: string;
  status: "active" | "inactive" | "suspended" | "banned";
  enrolledCourses: Types.ObjectId[];
  walletBalance: number;
  transactions: ITransaction[];
  notifications: INotification[];
  messages: IMessage[];
  loginHistory: ILoginHistory[];
  lastLogin?: Date;
  failedLoginAttempts: number;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  subscriptionPlan: "free" | "premium" | "enterprise";
  subscriptionStatus: "active" | "expired" | "canceled";
  subscriptionExpiresAt?: Date;
  agreedToTerms: boolean;
  timezone?: string;
  preferredLanguage?: string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

// ✅ Define User Schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    emailVerified: { type: Boolean, default: false },
    phone: { type: String, required: true, unique: true, index: true },
    phoneVerified: { type: Boolean, default: false },
    password: { type: String, required: true },

    // Company association for staff users
    company: { type: Types.ObjectId, ref: "Company", default: null, index: true },
    
    roles: [{ type: Types.ObjectId, ref: "Role" }],
    profileImage: { type: String, default: "default.png" },
    status: { type: String, enum: ["active", "inactive", "suspended", "banned"], default: "active" },

    enrolledCourses: [{ type: Types.ObjectId, ref: "Course" }],
    walletBalance: { type: Number, default: 0 },

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
        sender: { type: Types.ObjectId, ref: "User" },
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
    failedLoginAttempts: { type: Number, default: 0 },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },

    subscriptionPlan: { type: String, enum: ["free", "premium", "enterprise"], default: "free" },
    subscriptionStatus: { type: String, enum: ["active", "expired", "canceled"], default: "active" },
    subscriptionExpiresAt: { type: Date },

    agreedToTerms: { type: Boolean, default: false },
    timezone: { type: String, default: "UTC" },
    preferredLanguage: { type: String, default: "en" },
  },
  { timestamps: true }
);

// ✅ Virtual Field: Full Name
UserSchema.virtual("fullName").get(function (this: IUser) {
  return this.name;
});

// 🔐 **Hash password before saving**
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 🔄 **Compare Passwords**
UserSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

// ✅ Create & Export Model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
