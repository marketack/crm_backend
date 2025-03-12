import { Router } from "express";
import {
  assignEmployeeRole,
  getCompanyEmployees,
  updateEmployeeRole,
  removeEmployeeRole,
  updateEmployeeDetails,
} from "../controllers/employee.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

// ✅ Explicitly use `RequestHandler`
router.post("/assign", verifyJWT, requireRole(["admin", "customer", "owner"]), assignEmployeeRole as any);
router.get("/", verifyJWT, requireRole(["admin", "customer", "owner"]), getCompanyEmployees as any);
router.patch("/:userId/role", verifyJWT, requireRole(["admin", "customer", "owner"]), updateEmployeeRole as any);
router.delete("/:userId/role", verifyJWT, requireRole(["admin", "customer", "owner"]), removeEmployeeRole as any);
router.patch("/update/:userId", verifyJWT, requireRole(["admin", "customer", "owner"]), updateEmployeeDetails as any);

export default router;
