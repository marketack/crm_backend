import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ Protected Route for Admin, Staff, and Owner
router.get("/", verifyJWT, requireRole(["admin", "staff", "owner"]), getDashboardStats);

export default router;