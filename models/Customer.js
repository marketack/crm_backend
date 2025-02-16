const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Customer email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // Regex validation
    },
    phone: {
      type: String,
      required: [true, "Customer phone number is required"],
      trim: true,
      match: [/^\d{7,15}$/, "Phone number must be between 7 to 15 digits"], // Numeric validation
    },
    address: {
      type: String,
      required: [true, "Customer address is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Active", "Inactive", "Closed"], // ✅ Added status options
      default: "New",
    },
    assignedRep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ Reference to User model
      index: true, // Optimized indexing for queries
    },
    isDeleted: {
      type: Boolean,
      default: false, // ✅ Soft delete instead of permanent removal
    },
  },
  { timestamps: true } // ✅ Automatically adds `createdAt` & `updatedAt`
);

// ✅ Ensure `email` field is indexed for fast lookups
customerSchema.index({ email: 1 });

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
