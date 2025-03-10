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
/** ✅ Create an Employee */
export const createEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, position, department, email, phone, salary } = req.body;
        const employee = new Employee({
            name,
            position,
            department,
            email,
            phone,
            salary,
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, // Track who added the employee
        });
        yield employee.save();
        res.status(201).json(employee);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating employee", error });
    }
});
/** ✅ Get All Employees */
export const getEmployees = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield Employee.find().populate("department", "name");
        res.json(employees);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching employees", error });
    }
});
/** ✅ Update an Employee */
export const updateEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield Employee.findById(req.params.id);
        if (!employee) {
            res.status(404).json({ message: "Employee not found" });
            return;
        }
        Object.assign(employee, req.body);
        yield employee.save();
        res.json(employee);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating employee", error });
    }
});
/** ✅ Delete an Employee */
export const deleteEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield Employee.findById(req.params.id);
        if (!employee) {
            res.status(404).json({ message: "Employee not found" });
            return;
        }
        yield employee.deleteOne();
        res.json({ message: "Employee deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting employee", error });
    }
});
