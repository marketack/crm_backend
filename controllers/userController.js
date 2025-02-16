const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// Fetch all users (Admin only)
exports.getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select('-Password'); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch a specific user by ID (Admin only)
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-Password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a user by ID (Admin only)
exports.updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phoneNumber, username, location } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.FirstName = firstName || user.FirstName;
    user.LastName = lastName || user.LastName;
    user.Email = email || user.Email;
    user.PhoneNumber = phoneNumber || user.PhoneNumber;
    user.Username = username || user.Username;
    user.Location = location || user.Location;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

exports.changeUserRole = asyncHandler(async (req, res) => {
  const { email, newRole } = req.body;

  try {
    // Ensure user making the request is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins can change roles." });
    }

    // Validate role
    const validRoles = ["admin", "manager", "sales", "support", "customer"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role. Allowed roles: admin, manager, sales, support, customer." });
    }

    // Find user by email
    const user = await User.findOne({ Email: email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update the role
    user.role = newRole;
    await user.save();

    res.status(200).json({ message: `User role updated to ${newRole}` });
  } catch (error) {
    console.error("Role update error:", error);
    res.status(500).json({ message: "Server error while updating role" });
  }
});

// Fetch logged-in user's profile
exports.getUserProfile = asyncHandler(async (req, res) => {
  console.log("🔍 Checking req.user:", req.user); // Debugging log

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized. No user data found." });
  }

  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update logged-in user's profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, email, phoneNumber, location } = req.body;

    user.FirstName = firstName || user.FirstName;
    user.LastName = lastName || user.LastName;
    user.Email = email || user.Email;
    user.PhoneNumber = phoneNumber || user.PhoneNumber;
    user.Location = location || user.Location;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});