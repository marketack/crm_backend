const express = require("express");
const { createLead, getLeads, updateLead, deleteLead } = require("../controllers/leadController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createLead);
router.get("/", protect, getLeads);
router.put("/:id", protect, updateLead);
router.delete("/:id", protect, isAdmin, deleteLead);

module.exports = router;
