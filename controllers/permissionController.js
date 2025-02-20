const Permission = require("../models/Permission");
const asyncHandler = require("express-async-handler");

// ✅ Create a new permission
exports.createPermission = asyncHandler(async (req, res) => {
  const { name, description, category } = req.body;

  const existingPermission = await Permission.findOne({ name });
  if (existingPermission) return res.status(400).json({ message: "Permission already exists" });

  const newPermission = new Permission({ name, description, category });
  await newPermission.save();

  res.status(201).json({ message: "Permission created successfully", permission: newPermission });
});

// ✅ Get all permissions
exports.getPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.find();
  res.status(200).json(permissions);
});

// ✅ Update a permission
exports.updatePermission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, category } = req.body;

  const permission = await Permission.findByIdAndUpdate(id, { name, description, category }, { new: true });
  res.status(200).json({ message: "Permission updated successfully", permission });
});

// ✅ Delete a permission
exports.deletePermission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Permission.findByIdAndDelete(id);
  res.status(200).json({ message: "Permission deleted successfully" });
});
