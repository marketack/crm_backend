import { Request, Response } from "express";
import { Task } from "../models/task.model";
import { Project } from "../models/project.model";

/** ✅ Create a Task */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project, title, description, assignedTo, priority, dueDate, status } = req.body;

    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const task = new Task({
      project,
      title,
      description,
      assignedTo,
      priority: priority || "medium",
      status: status || "pending",
      dueDate,
      createdBy: req.user?.userId,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error });
  }
};

/** ✅ Get All Tasks with Filtering */
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority, project, assignedTo } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

/** ✅ Update a Task */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Ensure only Task Creator, Assignee, or Admins can update
    if (task.createdBy.toString() !== req.user?.userId && task.assignedTo?.toString() !== req.user?.userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: You can only update your assigned tasks" });
      return;
    }

    Object.assign(task, req.body);
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};

/** ✅ Delete a Task */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Only Task Creator or Admins can delete
    if (task.createdBy.toString() !== req.user?.userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: You can only delete your own tasks" });
      return;
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
};
