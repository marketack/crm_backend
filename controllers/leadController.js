const asyncHandler = require("express-async-handler");
const Lead = require("../models/Lead"); // Ensure Lead model exists

// Create a new lead
exports.createLead = asyncHandler(async (req, res) => {
  const { name, email, phone, status } = req.body;

  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All fields (name, email, phone) are required");
  }

  const lead = await Lead.create({
    name,
    email,
    phone,
    status: status || "New",
    createdBy: req.user.id,
  });

  res.status(201).json({ message: "Lead created successfully", lead });
});

// Get all leads
exports.getLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(leads);
});

// Update a lead
exports.updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  if (lead.createdBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this lead");
  }

  const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ message: "Lead updated successfully", updatedLead });
});

// Delete a lead
exports.deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  if (!req.user.isAdmin && lead.createdBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to delete this lead");
  }

  await Lead.deleteOne({ _id: req.params.id });

  res.status(200).json({ message: "Lead deleted successfully" });
});
