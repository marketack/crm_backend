import express from "express";
import {
  getAllActivityLogs,
  getUserActivityLogs,
  getEntityActivityLogs,
  deleteActivityLogs,
} from "../controllers/activityLog.controller";
import { verifyJWT } from "../middleware/authMiddleware";

const router = express.Router();

/** ✅ Get All Activity Logs (Admin Only) */
router.get("/", verifyJWT, getAllActivityLogs);

/** ✅ Get Activity Logs for a Specific User */
router.get("/user/:userId", verifyJWT, getUserActivityLogs);

/** ✅ Get Activity Logs for a Specific Entity (Lead, Customer, etc.) */
router.get("/:targetType/:targetId", verifyJWT, getEntityActivityLogs);

/** ✅ Delete Activity Logs (Admin Only) */
router.delete("/", verifyJWT, deleteActivityLogs);

export default router;
