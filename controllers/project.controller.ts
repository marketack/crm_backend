import { Request, Response } from "express";
import { Project } from "../models/project.model";
import { Task } from "../models/task.model";
import { IUser } from "../models/user.model"; // 🔄 Changed 'User' → 'IUser'
import { IRole } from "../models/role.model"; // 🔄 Changed 'Role' → 'IRole'
import mongoose, { Types } from "mongoose";

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
    const { name, description, budget, deadline, teamMembers, status, priority, milestones, dependencies } = req.body;

    const project = new Project({
      name,
      description,
      budget,
      deadline,
      teamMembers,
      status: status || "planned",
      priority: priority || "medium",
      milestones,
      dependencies,
      createdBy: req.user?.userId,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
};

/** ✅ Get All Projects with Advanced Filtering, Sorting, and Pagination */
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, createdBy, teamMember, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (createdBy) filter.createdBy = createdBy;
    if (teamMember) filter.teamMembers = { $elemMatch: { user: teamMember } };

    const sort: any = {};
    if (sortBy) sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const projects = await Project.find(filter)
      .populate("teamMembers.user", "name email")
      .populate("teamMembers.role", "name")
      .populate("createdBy", "name email")
      .populate("dependencies", "name")
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Project.countDocuments(filter);

    res.json({
      data: projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

/** ✅ Get a Single Project by ID */
export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("teamMembers.user", "name email")
      .populate("teamMembers.role", "name")
      .populate("createdBy", "name email")
      .populate("dependencies", "name");

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error });
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

    // Ensure only Project Managers, Admins, or Project Creators can update
    if (
      project.createdBy.toString() !== req.user?.userId &&
      !req.user?.roles.includes("admin") &&
      !req.user?.roles.includes("project_manager")
    ) {
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

/** ✅ Add/Update Expense for a Project */
export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { expenseId, amount, category, description, incurredAt } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Ensure only Project Managers, Admins, or Project Creators can update expenses
    if (
      project.createdBy.toString() !== req.user?.userId &&
      !req.user?.roles.includes("admin") &&
      !req.user?.roles.includes("project_manager")
    ) {
      res.status(403).json({ message: "Unauthorized: You can only update expenses for your projects" });
      return;
    }

    if (expenseId) {
      // Update existing expense
      const expense = project.expenses.id(expenseId);
      if (!expense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }

      expense.amount = amount;
      expense.category = category;
      expense.description = description;
      expense.incurredAt = incurredAt || expense.incurredAt;
    } else {
      // Add new expense
      project.expenses.push({ amount, category, description, incurredAt: incurredAt || new Date() });
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error updating expense", error });
  }
};

/** ✅ Delete Expense for a Project */
export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, expenseId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Ensure only Project Managers, Admins, or Project Creators can delete expenses
    if (
      project.createdBy.toString() !== req.user?.userId &&
      !req.user?.roles.includes("admin") &&
      !req.user?.roles.includes("project_manager")
    ) {
      res.status(403).json({ message: "Unauthorized: You can only delete expenses for your projects" });
      return;
    }

    const expense = project.expenses.id(expenseId);
    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    // Use Mongoose's `pull` method to remove the expense
    project.expenses.pull(expense);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error });
  }
};

/** ✅ Add/Update Milestone for a Project */
export const updateMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { milestoneId, title, description, dueDate, completed, progress, assignedTo } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Ensure only Project Managers, Admins, or Project Creators can update milestones
    if (
      project.createdBy.toString() !== req.user?.userId &&
      !req.user?.roles.includes("admin") &&
      !req.user?.roles.includes("project_manager")
    ) {
      res.status(403).json({ message: "Unauthorized: You can only update milestones for your projects" });
      return;
    }

    if (milestoneId) {
      // Update existing milestone
      const milestone = project.milestones.id(milestoneId);
      if (!milestone) {
        res.status(404).json({ message: "Milestone not found" });
        return;
      }

      milestone.title = title;
      milestone.description = description;
      milestone.dueDate = dueDate;
      milestone.completed = completed;
      milestone.progress = progress;
      milestone.assignedTo = assignedTo;
    } else {
      // Add new milestone
      project.milestones.push({ title, description, dueDate, completed: completed || false, progress: progress || 0, assignedTo });
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error updating milestone", error });
  }
};

/** ✅ Delete Milestone for a Project */
export const deleteMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, milestoneId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Ensure only Project Managers, Admins, or Project Creators can delete milestones
    if (
      project.createdBy.toString() !== req.user?.userId &&
      !req.user?.roles.includes("admin") &&
      !req.user?.roles.includes("project_manager")
    ) {
      res.status(403).json({ message: "Unauthorized: You can only delete milestones for your projects" });
      return;
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      res.status(404).json({ message: "Milestone not found" });
      return;
    }

    // Use Mongoose's `pull` method to remove the milestone
    project.milestones.pull(milestone);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error deleting milestone", error });
  }
};