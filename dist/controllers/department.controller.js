var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Department } from "../models/department.model";
/** ✅ Create a Department */
export const createDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const department = new Department({ name, description });
        yield department.save();
        res.status(201).json(department);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating department", error });
    }
});
/** ✅ Get All Departments */
export const getDepartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departments = yield Department.find();
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching departments", error });
    }
});
/** ✅ Update a Department */
export const updateDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const department = yield Department.findById(req.params.id);
        if (!department) {
            res.status(404).json({ message: "Department not found" });
            return;
        }
        Object.assign(department, req.body);
        yield department.save();
        res.json(department);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating department", error });
    }
});
/** ✅ Delete a Department */
export const deleteDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const department = yield Department.findById(req.params.id);
        if (!department) {
            res.status(404).json({ message: "Department not found" });
            return;
        }
        yield department.deleteOne();
        res.json({ message: "Department deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting department", error });
    }
});
