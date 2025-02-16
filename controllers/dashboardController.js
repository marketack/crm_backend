const asyncHandler = require("express-async-handler");
const Lead = require("../models/Lead");
const User = require("../models/User");
const Task = require("../models/Task"); // Ensure Task model exists

// Fetch Dashboard Data
exports.getDashboardData = asyncHandler(async (req, res) => {
  try {
    // Count the number of leads, customers (users with role: 'customer'), and tasks
    const leadsCount = await Lead.countDocuments();
    const customersCount = await User.countDocuments({ role: "customer" });
    const tasksCount = await Task.countDocuments();

    res.status(200).json({
      leads: leadsCount,
      customers: customersCount,
      tasks: tasksCount,
    });
  } catch (error) {
    console.error("Dashboard Data Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});
