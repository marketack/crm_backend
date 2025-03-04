import express from "express";
import {
  updateUserProfile,
  getUserProfile,  // ✅ New function
  getUserActivityLogs,
  generateApiKeyForUser,
  revokeApiKeyForUser,
  deactivateUser,
  deleteUser,
  getUserSubscriptionStatus,
} from "../controllers/user.controller";



import {
  verifyJWT,
  requireAdmin,
  requireRole,
  restrictSelfModification,
} from "../middleware/authMiddleware";

const router = express.Router();

// ✅ Secure User Routes
router.get("/profile/:userId", verifyJWT, getUserProfile);
router.put("/profile/:userId", verifyJWT, updateUserProfile);
router.get("/activity-logs", verifyJWT, getUserActivityLogs);
router.post("/api-key", verifyJWT, generateApiKeyForUser);
router.delete("/api-key", verifyJWT, revokeApiKeyForUser);
router.put("/deactivate", verifyJWT, deactivateUser);
router.delete("/", verifyJWT, requireAdmin, deleteUser); // ✅ Admin Only
router.get("/:userId/subscriptions", verifyJWT, getUserSubscriptionStatus);



export default router;
