import { Router } from "express";
import { createEmployee, getEmployees, updateEmployee, deleteEmployee } from "../controllers/employee.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";
const router = Router();
router.post("/", verifyJWT, requireRole(["admin", "manager"]), createEmployee);
router.get("/", verifyJWT, requireRole(["admin", "manager"]), getEmployees);
router.patch("/:id", verifyJWT, requireRole(["admin", "manager"]), updateEmployee);
router.delete("/:id", verifyJWT, requireRole(["admin"]), deleteEmployee);
export default router;
