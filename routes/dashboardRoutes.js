const express = require("express");
const { protect, isAdmin } = require("../middleware/authMiddleware"); // Ensure correct middleware
const { getDashboardData } = require("../controllers/dashboardController");

const router = express.Router();

// Dashboard API - Fetch leads, customers, and tasks count
router.get("/", protect, getDashboardData); // Protect to allow only logged-in users

module.exports = router;
