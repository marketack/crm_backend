const Role = require("../models/Role");
const Permission = require("../models/Permission");
const asyncHandler = require("express-async-handler");

// ✅ Create a new role
exports.createRole = asyncHandler(async (req, res) => {
  const { name, description, permissions } = req.body;

  const existingRole = await Role.findOne({ name });
  if (existingRole) return res.status(400).json({ message: "Role already exists" });

  const newRole = new Role({ name, description, permissions, createdBy: req.user._id });
  await newRole.save();

  res.status(201).json({ message: "Role created successfully", role: newRole });
});

// ✅ Get all roles
exports.getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().populate("permissions");
  res.status(200).json(roles);
});

// ✅ Update a role
exports.updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  const role = await Role.findByIdAndUpdate(id, { permissions }, { new: true }).populate("permissions");
  res.status(200).json({ message: "Role updated successfully", role });
});
