const express = require("express");
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport, // Ensure this is correctly imported
} = require("../controllers/reportController");

const router = express.Router();

// Create a new report
router.post("/", createReport);

// Get all reports
router.get("/", getReports);

// Get a single report by ID
router.get("/:id", getReportById);

// Update a report
router.put("/:id", updateReport);

// Delete a report
router.delete("/:id", deleteReport);

module.exports = router;
