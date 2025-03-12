import express from "express";
import {
  updateUserProfile,
  getUserProfile,
  getUserActivityLogs,
  generateApiKeyForUser,
  revokeApiKeyForUser,
  deactivateUser,
  deleteUser,
  getUserSubscriptionStatus,
  uploadProfileImage,
} from "../controllers/user.controller";
import upload from "../middleware/upload";

import { verifyJWT, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * ✅ Get User Profile
 * @route GET /api/users/{userId}
 */
router.get("/:userId", verifyJWT, getUserProfile);

/**
 * ✅ Update User Profile
 * @route PUT /api/users/{userId}
 */
router.put("/:userId", verifyJWT, updateUserProfile);

/**
 * ✅ Get User Activity Logs
 * @route GET /api/users/{userId}/activity-logs
 */
router.get("/:userId/activity-logs", verifyJWT, getUserActivityLogs);

/**
 * ✅ Generate API Key
 * @route POST /api/users/{userId}/api-key
 */
router.post("/:userId/api-key", verifyJWT, generateApiKeyForUser);

/**
 * ✅ Revoke API Key
 * @route DELETE /api/users/{userId}/api-key
 */
router.delete("/:userId/api-key", verifyJWT, revokeApiKeyForUser);

/**
 * ✅ Deactivate User
 * @route PUT /api/users/{userId}/deactivate
 */
router.put("/:userId/deactivate", verifyJWT, deactivateUser);

/**
 * ✅ Delete User (Admin Only)
 * @route DELETE /api/users/{userId}
 */
router.delete("/:userId", verifyJWT, requireAdmin, deleteUser);

/**
 * ✅ Get User Subscription Status
 * @route GET /api/users/{userId}/subscriptions
 */
router.get("/:userId/subscriptions", verifyJWT, getUserSubscriptionStatus);

router.post("/upload-profile-image", verifyJWT, upload.single("image"), uploadProfileImage);


export default router;
