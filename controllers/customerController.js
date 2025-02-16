const Customer = require("../models/Customer");
const asyncHandler = require("express-async-handler");

// Create Customer
exports.createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, address, assignedRep } = req.body;

  try {
    const customer = await Customer.create({ name, email, phone, address, assignedRep });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: "Error creating customer" });
  }
});

// Get Customers
exports.getCustomers = asyncHandler(async (req, res) => {
  try {
    const customers = await Customer.find().populate("assignedRep", "username email");
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving customers" });
  }
});

// Update Customer
exports.updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ message: "Error updating customer" });
  }
});

// Delete Customer
exports.deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await Customer.findByIdAndDelete(id);
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer" });
  }
});
