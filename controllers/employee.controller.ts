import { Request, Response } from "express";
import { Employee } from "../models/employee.model";

/** ✅ Create an Employee */
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, position, department, email, phone, salary } = req.body;

    const employee = new Employee({
      name,
      position,
      department,
      email,
      phone,
      salary,
      createdBy: req.user?.userId, // Track who added the employee
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error creating employee", error });
  }
};

/** ✅ Get All Employees */
export const getEmployees = async (_req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find().populate("department", "name");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error });
  }
};

/** ✅ Update an Employee */
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    Object.assign(employee, req.body);
    await employee.save();

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error updating employee", error });
  }
};

/** ✅ Delete an Employee */
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    await employee.deleteOne();
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error });
  }
};
