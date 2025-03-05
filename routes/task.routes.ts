import { Router } from "express";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/task.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyJWT, requireRole(["admin", "project_manager"]), createTask);
router.get("/", verifyJWT, getTasks);
router.patch("/:id", verifyJWT, requireRole(["admin", "project_manager", "team_member"]), updateTask);
router.delete("/:id", verifyJWT, requireRole(["admin", "project_manager"]), deleteTask);

export default router;
