const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  assignedRep: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assigned Sales Rep
  createdAt: { type: Date, default: Date.now },
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
