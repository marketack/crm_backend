import { Router } from "express";
import { createDepartment, getDepartments, updateDepartment, deleteDepartment } from "../controllers/department.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyJWT, requireRole(["admin"]), createDepartment);
router.get("/", verifyJWT, getDepartments);
router.patch("/:id", verifyJWT, requireRole(["admin"]), updateDepartment);
router.delete("/:id", verifyJWT, requireRole(["admin"]), deleteDepartment);

export default router;
