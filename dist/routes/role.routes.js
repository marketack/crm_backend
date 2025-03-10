import express from "express";
import { verifyJWT, requireAdmin, requirePermission } from "../middleware/authMiddleware";
import { createRole, getAllRoles, updateRolePermissions, deleteRole } from "../controllers/role.controller";
const router = express.Router();
// ✅ Only admins can create roles
router.post("/", verifyJWT, requireAdmin, createRole);
// ✅ Only users with "manage_roles" permission can view roles
router.get("/", verifyJWT, requirePermission(["manage_roles"]), getAllRoles);
// ✅ Only users with "manage_roles" permission can update role permissions
router.put("/:roleId", verifyJWT, requirePermission(["manage_roles"]), updateRolePermissions);
// ✅ Only admins can delete roles
router.delete("/:roleId", verifyJWT, requireAdmin, deleteRole);
export default router;
