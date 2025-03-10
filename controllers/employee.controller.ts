import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user.model";
import Company from "../models/company.model";
import Role from "../models/role.model";

/** ✅ Utility Function for Error Handling */
const handleError = (res: Response, error: any, message: string) => {
  console.error(`❌ ${message}:`, error);
  res.status(500).json({ message, error: error.message });
};

/** ✅ Assign Employee Role in a Company */
export const assignEmployeeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, position, department, salary, roleId } = req.body;
    const adminId = req.user?.userId;

    if (!userId || !position || !department || !salary || !roleId) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const adminUser = await User.findById(adminId).populate("company");
    if (!adminUser || !adminUser.company) {
      res.status(403).json({ message: "Unauthorized: You must be part of a company" });
      return;
    }

    const employeeUser = await User.findById(userId);
    if (!employeeUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (employeeUser.company) {
      res.status(400).json({ message: "User is already part of a company" });
      return;
    }

    // ✅ Fix: Ensure `roleId` is retrieved and properly cast
    const role = await Role.findById(roleId).lean();
    if (!role || !role._id) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    employeeUser.position = position;
    employeeUser.department = new mongoose.Types.ObjectId(department);
    employeeUser.salary = salary;
    employeeUser.company = adminUser.company._id;
    employeeUser.role = new mongoose.Types.ObjectId(role._id.toString()); // ✅ Fix applied here

    await employeeUser.save();

    await Company.findByIdAndUpdate(
      adminUser.company._id,
      { $push: { employees: employeeUser._id, team: employeeUser._id } },
      { new: true }
    );

    res.status(201).json({ message: "Employee added successfully", employeeUser });
  } catch (error) {
    handleError(res, error, "Error adding employee to company");
  }
};

/** ✅ Update Employee Role */
export const updateEmployeeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    const adminId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roleId)) {
      res.status(400).json({ message: "Invalid User ID or Role ID" });
      return;
    }

    const adminUser = await User.findById(adminId);
    if (!adminUser || !adminUser.company) {
      res.status(403).json({ message: "Unauthorized: You must be part of a company" });
      return;
    }

    const employeeUser = await User.findById(userId);
    if (!employeeUser || String(employeeUser.company) !== String(adminUser.company._id)) {
      res.status(404).json({ message: "Employee not found in your company" });
      return;
    }

    // ✅ Fix: Ensure role is retrieved properly and `_id` is correctly assigned
    const role = await Role.findById(roleId).lean();
    if (!role || !role._id) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    employeeUser.role = new mongoose.Types.ObjectId(role._id.toString()); // ✅ Fix applied here
    await employeeUser.save();

    res.json({ message: "Employee role updated successfully", employeeUser });
  } catch (error) {
    handleError(res, error, "Error updating employee role");
  }
};

/** ✅ Remove Employee Role */
export const removeEmployeeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid User ID" });
      return;
    }

    const employeeUser = await User.findById(userId);
    if (!employeeUser) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    // ✅ Fix: Ensure we correctly await role retrieval
    const defaultRole = await Role.findOne({ name: "customer" }).lean();
    if (!defaultRole || !defaultRole._id) {
      res.status(500).json({ message: "Default role 'customer' not found" });
      return;
    }

    employeeUser.role = new mongoose.Types.ObjectId(defaultRole._id.toString()); // ✅ Fix applied here
    await employeeUser.save();

    res.json({ message: "Employee role removed successfully", employeeUser });
  } catch (error) {
    handleError(res, error, "Error removing employee role");
  }
};


/** ✅ Get Employees with Role & Permissions */
/** ✅ Get Employees with Role & Department (From User Model) */
export const getCompanyEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    const adminUser = await User.findById(adminId);

    if (!adminUser || !adminUser.company) {
      res.status(403).json({ message: "Unauthorized: You must be part of a company" });
      return;
    }

    // ✅ Fetch Employees for the Admin's Company
    const employees = await User.find({ company: adminUser.company._id })
      .populate("company", "name") // ✅ Get Company Name
      .populate("role", "name permissions") // ✅ Get Role Name & Permissions
      .select("name email position department role company") // ✅ Select Required Fields
      .lean(); // ✅ Convert Mongoose Objects to Plain JSON

    // ✅ Extract Department from User Model Instead of Department Model
    const formattedEmployees = employees.map((employee) => ({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      position: employee.position,
      department: employee.department ? employee.department.toString() : "No Department", // ✅ Convert ObjectId to String
      role: employee.role,
      company: employee.company,
    }));

    res.json({ success: true, employees: formattedEmployees });
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    res.status(500).json({ message: "Error fetching employees", error: error.message });
  }
};
