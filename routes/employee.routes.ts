import { Router } from "express";
import {
  assignEmployeeRole,
  getCompanyEmployees,
  updateEmployeeRole,
  removeEmployeeRole,
} from "../controllers/employee.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

// ✅ Employee Management
router.post("/assign", verifyJWT, requireRole(["admin", "customer","owner"]), assignEmployeeRole);
router.get("/", verifyJWT, requireRole(["admin", "customer","owner"]), getCompanyEmployees);
router.patch("/:userId/role", verifyJWT, requireRole(["admin", "customer","owner"]), updateEmployeeRole);
router.delete("/:userId/role", verifyJWT, requireRole(["admin", "customer","owner"]), removeEmployeeRole);

export default router;
