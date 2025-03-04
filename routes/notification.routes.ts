import express from "express";
import {
  createNotification,
  getUserNotifications,
  getNotificationById,
  markNotificationAsRead,
  updateNotification,
  deleteNotifications,
} from "../controllers/notification.controller";
import { verifyJWT } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ Protect all notification routes with JWT
router.post("/", verifyJWT, createNotification);
router.get("/", verifyJWT, getUserNotifications);
router.get("/:id", verifyJWT, getNotificationById);
router.patch("/read", verifyJWT, markNotificationAsRead);
router.patch("/:id", verifyJWT, updateNotification);
router.delete("/", verifyJWT, deleteNotifications);

export default router;
