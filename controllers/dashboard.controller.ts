import { Request, Response } from "express";
import Employee from "../models/user.model";
import { Project } from "../models/project.model";
import { Deal } from "../models/deal.model";
import { Invoice } from "../models/invoice.model";
import { Task } from "../models/task.model";
import { Lead } from "../models/lead.model";
import { ActivityLog } from "../models/activityLog.model";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}

/** ✅ Enhanced Dashboard API (Company-Specific) */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    // ✅ Ensure the user is logged in and belongs to a company
    if (!user || !user.company) {
      res.status(403).json({ message: "Unauthorized: User does not belong to a company." });
      return; // ✅ Return void
    }

    const companyId = user.company;

    // **Total Counts (Filtered by Company)**
    const [totalEmployees, totalProjects, totalDeals, totalLeads] = await Promise.all([
      Employee.countDocuments({ company: companyId }),
      Project.countDocuments({ company: companyId }),
      Deal.countDocuments({ company: companyId }),
      Lead.countDocuments({ company: companyId }),
    ]);

    // **Lead Conversion Rate (Filtered by Company)**
    const convertedLeads = await Lead.countDocuments({ company: companyId, status: "closed_won" });
    const leadConversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) + "%" : "0%";

    // **Revenue Insights (Filtered by Company)**
    const [totalRevenue, pendingInvoices, overdueInvoices] = await Promise.all([
      Invoice.aggregate([
        { $match: { company: new mongoose.Types.ObjectId(companyId) } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Invoice.countDocuments({ company: companyId, status: "pending" }),
      Invoice.countDocuments({ company: companyId, status: "overdue" }),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // **Employee Performance (Tasks Completed) (Filtered by Company)**
    const employeePerformance = await Employee.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(companyId) } },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "assignedTo",
          as: "tasks",
        },
      },
      {
        $project: {
          name: 1,
          completedTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", "completed"] },
              },
            },
          },
        },
      },
      { $sort: { completedTasks: -1 } },
      { $limit: 5 },
    ]);

    // **Upcoming Deadlines (Filtered by Company)**
    const [upcomingTasks, upcomingInvoices, upcomingProjects] = await Promise.all([
      Task.find({ company: companyId, dueDate: { $gte: new Date() }, status: "in_progress" })
        .sort({ dueDate: 1 })
        .limit(5),
      Invoice.find({ company: companyId, dueDate: { $gte: new Date() }, status: "pending" })
        .sort({ dueDate: 1 })
        .limit(5),
      Project.find({ company: companyId, endDate: { $gte: new Date() } })
        .sort({ endDate: 1 })
        .limit(5),
    ]);

    // **Recent Activity Logs (Filtered by Company)**
    const recentActivities = await ActivityLog.find({ company: companyId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate("userId", "name email");

    // **Get Employees of the Company**
    const employees = await Employee.find({ company: companyId })
      .select("name email position department role")
      .populate({
        path: "company",
        select: "departments",
      })
      .populate("role", "name")
      .lean();

    // ✅ Send the response
    res.json({
      stats: {
        totalEmployees,
        totalProjects,
        totalDeals,
        totalLeads,
        leadConversionRate,
        revenue,
        pendingInvoices,
        overdueInvoices,
      },
      performance: {
        topEmployees: employeePerformance,
      },
      upcoming: {
        tasks: upcomingTasks,
        invoices: upcomingInvoices,
        projects: upcomingProjects,
      },
      activityLogs: recentActivities,
      employees, // ✅ Add employees to the response
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};