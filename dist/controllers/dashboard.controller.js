var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Employee } from "../models/employee.model";
import { Project } from "../models/project.model";
import { Deal } from "../models/deal.model";
import { Invoice } from "../models/invoice.model";
import { Task } from "../models/task.model";
export const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalEmployees = yield Employee.countDocuments();
        const totalProjects = yield Project.countDocuments();
        const totalDeals = yield Deal.countDocuments();
        const totalInvoices = yield Invoice.countDocuments({ status: "pending" }); // Only pending invoices
        const totalTasks = yield Task.countDocuments({ status: "in_progress" });
        // Get upcoming deadlines
        const upcomingTasks = yield Task.find({ dueDate: { $gte: new Date() } }).sort({ dueDate: 1 }).limit(5);
        const upcomingInvoices = yield Invoice.find({ dueDate: { $gte: new Date() } }).sort({ dueDate: 1 }).limit(5);
        const upcomingProjects = yield Project.find({ endDate: { $gte: new Date() } }).sort({ endDate: 1 }).limit(5);
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
    }
    catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
