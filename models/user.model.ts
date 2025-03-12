import mongoose, { Document, Schema, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

/** ✅ Define Transaction Interface */
interface ITransaction {
  type: "deposit" | "withdrawal" | "course_purchase";
  amount: number;
  date: Date;
  status: "pending" | "completed" | "failed";
}

/** ✅ Define Notification Interface */
interface INotification {
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: Date;
}

/** ✅ Define Message Interface */
interface IMessage {
  sender: Types.ObjectId;
  content: string;
  date: Date;
}

/** ✅ Define Performance Review Interface */
interface IPerformanceReview {
  date: Date;
  review: string;
  rating: number;
}

/** ✅ Define Login History Interface */
interface ILoginHistory {
  ip: string;
  device: string;
  location: string;
  date: Date;
}

/** ✅ Define User Interface */
export interface IUser extends Document {
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  password: string;
  role: Types.ObjectId | { _id: Types.ObjectId; name: string }; // ✅ Allows ObjectId or Populated Role
  company?: Types.ObjectId | null;
  department?: Types.ObjectId | null;
  reportsTo?: Types.ObjectId | null;
  position?: string;
  profileImage?: string;
  status: "active" | "inactive" | "suspended" | "banned";
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
  transactions: ITransaction[];
  notifications: INotification[];
  messages: IMessage[];
  loginHistory: ILoginHistory[];
  enrolledCourses: Types.ObjectId[]; // ✅ Stores courses the user is enrolled in
  comparePassword(enteredPassword: string): Promise<boolean>;
  salary?: number;
  performanceReviews?: IPerformanceReview[];
  createdAt: Date;
  updatedAt: Date;
}

/** ✅ Define User Schema */
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    emailVerified: { type: Boolean, default: false },
    phone: { type: String, required: true, unique: true, index: true },
    phoneVerified: { type: Boolean, default: false },
    password: { type: String, required: true },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course", default: [] }],

    // ✅ Reference Role Model Instead of Embedding Role Data
    role: { type: Schema.Types.ObjectId, ref: "Role", default: null },

    // ✅ Employee & Organization Data
    company: { type: Schema.Types.ObjectId, ref: "Company", default: null }, // ✅ Ensure company reference exists
    department: { type: Schema.Types.ObjectId, ref: "Department", default: null }, // ✅ Reference to Department
    reportsTo: { type: Schema.Types.ObjectId, ref: "User", default: null }, // ✅ FIX: Ensure `reportsTo` is properly referenced
    position: { type: String, default: "" },
    salary: { type: Number, default: 0 },
    performanceReviews: [
      {
        date: { type: Date, default: Date.now },
        review: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
      },
    ],

    // ✅ General User Fields
    profileImage: { type: String, default: "/uploads/default.png" }, // ✅ Default profile image
    status: { type: String, enum: ["active", "inactive", "suspended", "banned"], default: "active" },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },

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

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },

    subscriptionPlan: { type: String, enum: ["free", "premium", "enterprise"], default: "free" },
    subscriptionStatus: { type: String, enum: ["active", "expired", "canceled"], default: "active" },
    subscriptionExpiresAt: { type: Date },

    agreedToTerms: { type: Boolean, default: false },
    timezone: { type: String, default: "UTC" },
    preferredLanguage: { type: String, default: "en" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🔐 **Hash password before saving**
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next(); // ✅ Skip if password is unchanged

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// ✅ Compare Passwords Correctly
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

// ✅ Create & Export Model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
