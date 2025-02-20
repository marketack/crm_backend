const asyncHandler = require("express-async-handler");
const Lead = require("../models/Lead");
const User = require("../models/User");
const Permission = require("../models/Permission");

// ✅ Create a new lead (Requires "create_lead" permission)
exports.createLead = asyncHandler(async (req, res) => {
  try {
    // ✅ Check if the user has permission to create a lead
    const hasPermission = req.user.permissions.some((perm) => perm.name === "create_lead");
    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: You don't have permission to create a lead" });
    }

    const { name, email, phone, company, status, source, assignedTo, tags, address, city, state, country, zipCode, leadValue, defaultLanguage, description, publicContactedToday } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, email, and phone are required" });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      status: status || "New",
      source,
      assignedTo,
      tags,
      address,
      city,
      state,
      country,
      zipCode,
      leadValue,
      defaultLanguage,
      description,
      publicContactedToday,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Lead created successfully", lead });
  } catch (error) {
    console.error("Create Lead Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get all leads (Requires "view_leads" permission)
exports.getLeads = asyncHandler(async (req, res) => {
  try {
    const hasPermission = req.user.permissions.some((perm) => perm.name === "view_leads");
    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: You don't have permission to view leads" });
    }

    let query = {};

    // ✅ Admins see all leads, normal users see only assigned leads
    if (req.user.role.name !== "Admin" && req.user.role.name !== "Super Admin") {
      query.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }

    const leads = await Lead.find(query).populate("assignedTo", "firstName lastName email");

    if (!leads.length) {
      return res.status(404).json({ message: "No leads found" });
    }

    res.status(200).json(leads);
  } catch (error) {
    console.error("Get Leads Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Update a lead (Requires "edit_lead" permission)
exports.updateLead = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const hasPermission = req.user.permissions.some((perm) => perm.name === "edit_lead");
    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: You don't have permission to edit this lead" });
    }

    Object.assign(lead, req.body);
    await lead.save();

    res.status(200).json({ message: "Lead updated successfully", lead });
  } catch (error) {
    console.error("Update Lead Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Delete a lead (Requires "delete_lead" permission)
exports.deleteLead = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const hasPermission = req.user.permissions.some((perm) => perm.name === "delete_lead");
    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: You don't have permission to delete this lead" });
    }

    await lead.deleteOne();

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Delete Lead Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
