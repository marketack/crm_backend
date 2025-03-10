import express from "express";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";
import { createRole, getAllRoles, updateRolePermissions, deleteRole } from "../controllers/role.controller";

const router = express.Router();

// ✅ Only admins can create roles
router.post("/", verifyJWT, requireRole(["admin", "customer","owner"]), createRole);

// ✅ Only users with "manage_roles" permission can view roles
router.get("/", verifyJWT, requireRole(["admin", "customer","owner"]), getAllRoles);

// ✅ Only users with "manage_roles" permission can update role permissions
router.put("/:roleId", verifyJWT, requireRole(["admin", "customer","owner"]), updateRolePermissions);

// ✅ Only admins can delete roles
router.delete("/:roleId", verifyJWT, requireRole(["admin", "owner"]), deleteRole);

export default router;
