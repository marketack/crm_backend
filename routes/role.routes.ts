import express from "express";
import {
  createRole,
  getAllRoles,
  updateRolePermissions,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  assignPermissionToRole,
  removePermissionFromRole,
} from "../controllers/role.controller";
import { verifyJWT, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", verifyJWT, requireAdmin, async (req, res) => {
  await createRole(req, res);
});

router.get("/", verifyJWT, requireAdmin, async (req, res) => {
  await getAllRoles(req, res);
});

router.put("/:roleId", verifyJWT, requireAdmin, async (req, res) => {
  await updateRolePermissions(req, res);
});

router.delete("/:roleId", verifyJWT, requireAdmin, async (req, res) => {
  await deleteRole(req, res);
});

router.post("/assign-role", verifyJWT, requireAdmin, async (req, res) => {
  await assignRoleToUser(req, res);
});

router.post("/remove-role", verifyJWT, requireAdmin, async (req, res) => {
  await removeRoleFromUser(req, res);
});

router.post("/assign-permission", verifyJWT, requireAdmin, async (req, res) => {
  await assignPermissionToRole(req, res);
});

router.post("/remove-permission", verifyJWT, requireAdmin, async (req, res) => {
  await removePermissionFromRole(req, res);
});

export default router;
