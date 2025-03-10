var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Project } from "../models/project.model";
import { Task } from "../models/task.model";
/** ✅ Create a Project */
export const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        });
        yield project.save();
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating project", error });
    }
});
/** ✅ Get All Projects with Filtering */
export const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, teamMember } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (teamMember)
            filter.teamMembers = teamMember;
        const projects = yield Project.find(filter)
            .populate("teamMembers", "name email")
            .populate("createdBy", "name email");
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching projects", error });
    }
});
/** ✅ Update a Project */
export const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const project = yield Project.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Ensure only Project Managers or Admins can update
        if (project.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin")) && !((_c = req.user) === null || _c === void 0 ? void 0 : _c.roles.includes("project_manager"))) {
            res.status(403).json({ message: "Unauthorized: You can only update your projects" });
            return;
        }
        Object.assign(project, req.body);
        yield project.save();
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating project", error });
    }
});
/** ✅ Delete a Project */
export const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const project = yield Project.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Ensure only Admins or Project Creators can delete
        if (project.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only delete your own projects" });
            return;
        }
        // Delete all tasks related to the project
        yield Task.deleteMany({ project: project._id });
        yield project.deleteOne();
        res.json({ message: "Project and associated tasks deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting project", error });
    }
});
