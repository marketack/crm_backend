const express = require("express");
const { createCustomer, getCustomers, updateCustomer, deleteCustomer } = require("../controllers/customerController");
const { protect, isAdmin } = require("../middleware/authMiddleware"); // Import fixed middleware

const router = express.Router();

// Customer Routes
router.route("/")
  .post(protect, createCustomer)   // Only logged-in users can create customers
  .get(protect, getCustomers);     // Only logged-in users can get customers

router.route("/:id")
  .put(protect, updateCustomer)    // Only logged-in users can update customers
  .delete(protect, isAdmin, deleteCustomer); // Only admins can delete customers

module.exports = router;
