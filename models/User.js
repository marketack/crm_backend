const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, maxLength: 50 },
  lastName: { type: String, required: true, maxLength: 50 },
  email: { type: String, required: true, maxLength: 256, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 8 },
  role: {
    type: String,
    enum: ["admin", "manager", "sales", "support", "customer"],
    default: "customer",
  }, // CRM-Specific Roles
  refreshToken: String,
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  otp: {
    code: String,
    expiresAt: Date,
  },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    secret: String, // TOTP Secret for Multi-Factor Authentication
  },
  createdAt: { type: Date, default: Date.now },
});

// Virtual formatted registration date
userSchema.virtual("formattedDate").get(function () {
  return DateTime.fromJSDate(this.createdAt).toFormat("LLL dd, yyyy");
});

// Pre-save hook to enforce password rules
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  if (this.password.length < 8) {
    return next(new Error("Password must be at least 8 characters long."));
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
