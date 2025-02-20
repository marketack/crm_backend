const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { DateTime } = require("luxon");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Role assigned to the user
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },

    // Additional permissions assigned directly
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],

    isEmailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended", "deactivated"], default: "active" },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
