import { Router } from "express";
import { createProject, getProjects, updateProject, deleteProject } from "../controllers/project.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyJWT, requireRole(["admin", "project_manager"]), createProject);
router.get("/", verifyJWT, getProjects);
router.patch("/:id", verifyJWT, requireRole(["admin", "project_manager"]), updateProject);
router.delete("/:id", verifyJWT, requireRole(["admin"]), deleteProject);

export default router;
