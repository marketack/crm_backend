import { Request, Response } from "express";
import Employee from "../models/user.model";
import {Project} from "../models/project.model";
import {Deal} from "../models/deal.model";
import {Invoice} from "../models/invoice.model";
import {Task} from "../models/task.model";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalDeals = await Deal.countDocuments();
    const totalInvoices = await Invoice.countDocuments({ status: "pending" }); // Only pending invoices
    const totalTasks = await Task.countDocuments({ status: "in_progress" });

    // Get upcoming deadlines
    const upcomingTasks = await Task.find({ dueDate: { $gte: new Date() } }).sort({ dueDate: 1 }).limit(5);
    const upcomingInvoices = await Invoice.find({ dueDate: { $gte: new Date() } }).sort({ dueDate: 1 }).limit(5);
    const upcomingProjects = await Project.find({ endDate: { $gte: new Date() } }).sort({ endDate: 1 }).limit(5);

    res.json({
      stats: {
        totalEmployees,
        totalProjects,
        totalDeals,
        totalInvoices,
        totalTasks,
      },
      upcoming: {
        tasks: upcomingTasks,
        invoices: upcomingInvoices,
        projects: upcomingProjects,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
