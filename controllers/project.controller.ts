import { Request, Response } from "express";
import { Project } from "../models/project.model";
import { Task } from "../models/task.model";
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}
/** ✅ Create a Project */
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, budget, deadline, teamMembers, status, milestones } = req.body;

    const project = new Project({
      name,
      description,
      budget,
      deadline,
      teamMembers,
      status: status || "planned",
      milestones,
      createdBy: req.user?.userId,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
};

/** ✅ Get All Projects with Filtering */
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, teamMember } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (teamMember) filter.teamMembers = teamMember;

    const projects = await Project.find(filter)
      .populate("teamMembers", "name email")
      .populate("createdBy", "name email");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

/** ✅ Update a Project */
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Ensure only Project Managers or Admins can update
    if (project.createdBy.toString() !== req.user?.userId && !req.user?.roles.includes("admin") && !req.user?.roles.includes("project_manager")) {
      res.status(403).json({ message: "Unauthorized: You can only update your projects" });
      return;
    }

    Object.assign(project, req.body);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error });
  }
};

/** ✅ Delete a Project */
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Ensure only Admins or Project Creators can delete
    if (project.createdBy.toString() !== req.user?.userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: You can only delete your own projects" });
      return;
    }

    // Delete all tasks related to the project
    await Task.deleteMany({ project: project._id });

    await project.deleteOne();
    res.json({ message: "Project and associated tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error });
  }
};
