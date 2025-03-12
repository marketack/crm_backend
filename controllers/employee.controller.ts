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

/** ✅ Assign Employee to Company (Find by Email) */
export const assignEmployeeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, position, department, salary, company,reportsTo } = req.body;

    // ✅ Validate required fields
    if (!email || !position || !department || !salary || !company) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // ✅ Fetch the employee user by email
    const employeeUser = await User.findOne({ email });

    if (!employeeUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (employeeUser.company) {
      res.status(400).json({ message: "User is already part of a company" });
      return;
    }

    // ✅ Ensure "staff" role is assigned by default
    const staffRole = await Role.findOne({ name: "staff" }).lean();
    if (!staffRole || !staffRole._id) {
      res.status(500).json({ message: "Default role 'staff' not found" });
      return;
    }

    // ✅ Assign employee to company with "staff" role
    employeeUser.position = position;
    employeeUser.department = department;
    employeeUser.salary = salary;
    employeeUser.company = new mongoose.Types.ObjectId(company);
    employeeUser.role = new mongoose.Types.ObjectId(staffRole._id.toString()); // ✅ Assign "staff" role
    employeeUser.reportsTo = reportsTo;

    await employeeUser.save();

    // ✅ Add employee to company's employee list
    await Company.findByIdAndUpdate(
      company,
      { $push: { employees: employeeUser._id } },
      { new: true }
    );

    res.status(201).json({ message: "Employee added successfully", employeeUser });
  } catch (error) {
    handleError(res, error, "Error adding employee to company");
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

    // ✅ Assign default role
    const defaultRole = await Role.findOne({ name: "customer" }).lean();
    if (!defaultRole || !defaultRole._id) {
      res.status(500).json({ message: "Default role 'customer' not found" });
      return;
    }

    employeeUser.role = new mongoose.Types.ObjectId(defaultRole._id.toString());
    await employeeUser.save();

    res.json({ message: "Employee role removed successfully", employeeUser });
  } catch (error) {
    handleError(res, error, "Error removing employee role");
  }
};

/** ✅ Get Employees of the Company */
export const getCompanyEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req as any; // ✅ Cast req to avoid TS errors

    if (!user.user?.company) {
      res.status(403).json({ message: "Unauthorized: You must be part of a company" });
      return;
    }

    // ✅ Fetch Employees for the User's Company with Department and ReportsTo Name
    const employees = await User.find({ company: user.user.company })
      .populate({ path: "company", select: "name departments _id" }) // ✅ Populate Company Name & Departments
      .populate({ path: "role", select: "name permissions _id" }) // ✅ Populate Role Name & Permissions
      .populate({ path: "reportsTo", select: "name _id" }) // ✅ Populate Supervisor Name
      .select("name email position department role company salary reportsTo createdAt updatedAt")
      .lean(); // ✅ Convert Mongoose Objects to Plain JSON

    // ✅ Fetch the company and departments
    const company = await Company.findById(user.user.company).select("departments").lean();
    const departmentMap = company?.departments.reduce((acc, dept) => {
      acc[dept._id.toString()] = dept.name; // ✅ Map department _id to name
      return acc;
    }, {} as Record<string, string>) || {};

    // ✅ Format employee data correctly
    const formattedEmployees = employees.map((employee) => ({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      position: employee.position || "Not Specified",
      salary: employee.salary ? `$${employee.salary.toLocaleString()}` : "Not Available",

      department: employee.department
        ? { _id: employee.department.toString(), name: departmentMap[employee.department.toString()] || "Unknown Department" }
        : { _id: "unknown", name: "No Department" },

      role: employee.role && typeof employee.role === "object"
        ? { _id: employee.role._id.toString(), name: (employee.role as any).name, permissions: (employee.role as any).permissions || [] }
        : { _id: "unknown", name: "No Role Assigned", permissions: [] },

      company: employee.company && typeof employee.company === "object"
        ? { _id: employee.company._id.toString(), name: (employee.company as any).name }
        : { _id: "unknown", name: "No Company" },

      reportsTo: employee.reportsTo && typeof employee.reportsTo === "object"
        ? { _id: employee.reportsTo._id.toString(), name: (employee.reportsTo as any).name || "No Supervisor" }
        : { _id: "unknown", name: "No Supervisor" },

      createdAt: employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : "Unknown",
      updatedAt: employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : "Unknown",
    }));

    res.json({ success: true, employees: formattedEmployees });
  } catch (error) {
    handleError(res, error, "Error fetching employees");
  }
};



/** ✅ Update Employee Role (Modify Later) */
export const updateEmployeeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roleId)) {
      res.status(400).json({ message: "Invalid User ID or Role ID" });
      return;
    }

    const employeeUser = await User.findById(userId);
    if (!employeeUser || String(employeeUser.company) !== String((req as any).user.company)) {
      res.status(404).json({ message: "Employee not found in your company" });
      return;
    }

    // ✅ Ensure role exists
    const role = await Role.findById(roleId).lean();
    if (!role || !role._id) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    employeeUser.role = new mongoose.Types.ObjectId(role._id.toString());
    await employeeUser.save();

    res.json({ message: "Employee role updated successfully", employeeUser });
  } catch (error) {
    handleError(res, error, "Error updating employee role");
  }
};

/** ✅ Update Employee Details (Position, Salary, Department, Role, Reports To) */
/** ✅ Update Employee Details (Position, Salary, Department, Role, Reports To) */
export const updateEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { position, salary, department, roleId, reportsTo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid Employee ID" });
      return;
    }

    // ✅ Find Employee
    const employeeUser = await User.findById(userId);
    if (!employeeUser) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    // ✅ Update Position & Salary
    if (position) employeeUser.position = position;
    if (salary !== undefined) employeeUser.salary = salary;
    if (department) employeeUser.department = department;

    // ✅ Update Role if roleId is provided
    if (roleId) {
      if (!mongoose.Types.ObjectId.isValid(roleId)) {
        res.status(400).json({ message: "Invalid Role ID" });
        return;
      }
      const role = await Role.findById(roleId).lean();
      if (!role) {
        res.status(404).json({ message: "Role not found" });
        return;
      }
      employeeUser.role = new mongoose.Types.ObjectId(role._id.toString());
    }

    // ✅ Update Reports To (Supervisor)
    if (reportsTo) {
      if (!mongoose.Types.ObjectId.isValid(reportsTo)) {
        res.status(400).json({ message: "Invalid Supervisor ID" });
        return;
      }
      const supervisor = await User.findById(reportsTo).lean();
      if (!supervisor) {
        res.status(404).json({ message: "Supervisor not found" });
        return;
      }
      employeeUser.reportsTo = new mongoose.Types.ObjectId(reportsTo);
    }

    await employeeUser.save();

    res.json({ message: "✅ Employee details updated successfully", employeeUser });
  } catch (error) {
    handleError(res, error, "Error updating employee details");
  }

};

