const Staff = require("../models/Staff");
const asyncHandler = require("express-async-handler");


// ✅ Create Staff (Admin Only)
exports.createStaff = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "Staff member already exists" });
    }

    const newStaff = await Staff.create({ name, email, role });
    res.status(201).json(newStaff);
  } catch (error) {
    res.status(500).json({ message: "Error adding staff", error: error.message });
  }
});

// ✅ Get All Staff Members
exports.getAllStaff = asyncHandler(async (req, res) => {
  try {
    const staff = await Staff.find();
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff", error: error.message });
  }
});

// ✅ Delete Staff (Admin Only)
exports.deleteStaff = asyncHandler(async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    await staff.deleteOne();
    res.status(200).json({ message: "Staff deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting staff", error: error.message });
  }
});
