import { Request, Response } from "express";
import Employee from "../models/user.model";
import { Project } from "../models/project.model";
import { Deal } from "../models/deal.model";
import { Invoice } from "../models/invoice.model";
import { Task } from "../models/task.model";
import { Lead } from "../models/lead.model";
import {ActivityLog} from "../models/activityLog.model";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}

/** ✅ Enhanced Dashboard API */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // **Total Counts**
    const [totalEmployees, totalProjects, totalDeals, totalLeads] = await Promise.all([
      Employee.countDocuments(),
      Project.countDocuments(),
      Deal.countDocuments(),
      Lead.countDocuments(),
    ]);

    // **Lead Conversion Rate**
    const convertedLeads = await Lead.countDocuments({ status: "closed_won" });
    const leadConversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) + "%" : "0%";

    // **Revenue Insights**
    const [totalRevenue, pendingInvoices, overdueInvoices] = await Promise.all([
      Invoice.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Invoice.countDocuments({ status: "pending" }),
      Invoice.countDocuments({ status: "overdue" }),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // **Employee Performance (Tasks Completed)**
    const employeePerformance = await Employee.aggregate([
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

    // **Upcoming Deadlines**
    const [upcomingTasks, upcomingInvoices, upcomingProjects] = await Promise.all([
      Task.find({ dueDate: { $gte: new Date() }, status: "in_progress" }).sort({ dueDate: 1 }).limit(5),
      Invoice.find({ dueDate: { $gte: new Date() }, status: "pending" }).sort({ dueDate: 1 }).limit(5),
      Project.find({ endDate: { $gte: new Date() } }).sort({ endDate: 1 }).limit(5),
    ]);

    // **Recent Activity Logs**
    const recentActivities = await ActivityLog.find().sort({ timestamp: -1 }).limit(10).populate("userId", "name email");

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
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
