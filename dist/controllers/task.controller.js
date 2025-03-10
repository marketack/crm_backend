var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Task } from "../models/task.model";
import { Project } from "../models/project.model";
/** ✅ Create a Task */
export const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { project, title, description, assignedTo, priority, dueDate, status } = req.body;
        // Check if project exists
        const projectExists = yield Project.findById(project);
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
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        });
        yield task.save();
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating task", error });
    }
});
/** ✅ Get All Tasks with Filtering */
export const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, priority, project, assignedTo } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (priority)
            filter.priority = priority;
        if (project)
            filter.project = project;
        if (assignedTo)
            filter.assignedTo = assignedTo;
        const tasks = yield Task.find(filter)
            .populate("project", "name")
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error });
    }
});
/** ✅ Update a Task */
export const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const task = yield Task.findById(req.params.id);
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        // Ensure only Task Creator, Assignee, or Admins can update
        if (task.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && ((_b = task.assignedTo) === null || _b === void 0 ? void 0 : _b.toString()) !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId) && !((_d = req.user) === null || _d === void 0 ? void 0 : _d.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only update your assigned tasks" });
            return;
        }
        Object.assign(task, req.body);
        yield task.save();
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating task", error });
    }
});
/** ✅ Delete a Task */
export const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const task = yield Task.findById(req.params.id);
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        // Only Task Creator or Admins can delete
        if (task.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only delete your own tasks" });
            return;
        }
        yield task.deleteOne();
        res.json({ message: "Task deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting task", error });
    }
});
