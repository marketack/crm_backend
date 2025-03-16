import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateExpense,
  deleteExpense,
  updateMilestone,
  deleteMilestone,
} from "../controllers/project.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

// ✅ Create a new project
router.post("/", verifyJWT, requireRole(["admin","owner","staff ","project_manager"]), createProject);

// ✅ Get all projects (with filtering, sorting, and pagination)
router.get("/", verifyJWT, getProjects);

// ✅ Get a single project by ID
router.get("/:id", verifyJWT, getProjectById);

// ✅ Update a project
router.patch("/:id", verifyJWT, requireRole(["admin","owner","staff ","project_manager"]), updateProject);

// ✅ Delete a project
router.delete("/:id", verifyJWT, requireRole(["admin"]), deleteProject);

// ✅ Add/Update an expense for a project
router.put("/:projectId/expenses", verifyJWT, requireRole(["admin","owner","staff ","project_manager"]), updateExpense);

// ✅ Delete an expense for a project
router.delete("/:projectId/expenses/:expenseId", verifyJWT, requireRole(["admin","owner","staff ","project_manager"]), deleteExpense);

// ✅ Add/Update a milestone for a project
router.put("/:projectId/milestones", verifyJWT, requireRole(["admin","owner","staff ","project_manager"]), updateMilestone);

// ✅ Delete a milestone for a project
router.delete("/:projectId/milestones/:milestoneId", verifyJWT, requireRole(["admin","owner","staff ","project_manager"]), deleteMilestone);

export default router;