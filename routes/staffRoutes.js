const express = require("express");
const { createStaff, getAllStaff, deleteStaff } = require("../controllers/staffController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getAllStaff); // Get all staff (requires authentication)
router.route("/").post(protect, isAdmin, createStaff); // Create staff (Admin Only)
router.route("/:id").delete(protect, isAdmin, deleteStaff); // Delete staff (Admin Only)

module.exports = router;
