const asyncHandler = require("express-async-handler");
const Lead = require("../models/Lead");

// Valid status options
const VALID_STATUSES = ["New", "In Progress", "Closed"];

// ✅ Create a new lead
exports.createLead = asyncHandler(async (req, res) => {
  try {
    console.log("📩 Incoming Lead Data:", req.body);

    const { name, email, phone, company, status } = req.body;

    // ✅ Ensure required fields are present
    if (!name || !email || !phone || !company) {
      console.error("🚨 Missing required fields:", { name, email, phone, company });
      return res.status(400).json({ error: "All fields (name, email, phone, company) are required" });
    }

    // ✅ Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      console.error("🚨 Invalid email format:", email);
      return res.status(400).json({ error: "Invalid email format" });
    }

    // ✅ Ensure user ID is available
    if (!req.user || !req.user.id) {
      console.error("🚨 User ID is missing from request.");
      return res.status(401).json({ error: "User authentication required" });
    }

    // ✅ Create the lead
    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      status: status || "New",
      createdBy: req.user.id,
    });

    console.log("✅ Lead created successfully:", lead);

    res.status(201).json({ message: "Lead created successfully", lead });
  } catch (error) {
    console.error("🚨 Create Lead Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


// ✅ Get all leads for the authenticated user
exports.getLeads = asyncHandler(async (req, res) => {
  try {
    const leads = await Lead.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

    if (!leads.length) {
      return res.status(404).json({ message: "No leads found" });
    }

    res.status(200).json(leads);
  } catch (error) {
    console.error("Get Leads Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Update a lead
exports.updateLead = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Ensure `id` is a valid ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid lead ID format" });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // ✅ Ensure only the owner can update
    if (lead.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this lead" });
    }

    const updatedLead = await Lead.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Lead updated successfully", updatedLead });
  } catch (error) {
    console.error("Update Lead Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ Delete a lead
exports.deleteLead = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // ✅ Ensure only the owner or an admin can delete the lead
    if (!req.user.isAdmin && lead.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this lead" });
    }

    await Lead.deleteOne({ _id: id });

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Delete Lead Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
