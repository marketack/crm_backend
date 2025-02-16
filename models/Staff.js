const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Staff name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  role: {
    type: String,
    enum: ["Admin", "Staff"],
    default: "Staff",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Staff = mongoose.model("Staff", staffSchema);
module.exports = Staff;
