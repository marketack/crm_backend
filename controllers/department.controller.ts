import { Request, Response } from "express";
import { Department } from "../models/department.model";

/** ✅ Create a Department */
export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    const department = new Department({ name, description });
    await department.save();

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: "Error creating department", error });
  }
};

/** ✅ Get All Departments */
export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments", error });
  }
};

/** ✅ Update a Department */
export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    Object.assign(department, req.body);
    await department.save();

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: "Error updating department", error });
  }
};

/** ✅ Delete a Department */
export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    await department.deleteOne();
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting department", error });
  }
};
