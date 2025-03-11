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
    const { email, position, department, salary, company } = req.body;

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
    employeeUser.department = new mongoose.Types.ObjectId(department);
    employeeUser.salary = salary;
    employeeUser.company = new mongoose.Types.ObjectId(company);
    employeeUser.role = new mongoose.Types.ObjectId(staffRole._id.toString()); // ✅ Assign "staff" role

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
    const user = req as any; // ✅ Cast req to any to avoid TS errors

    if (!user.user?.company) {
      res.status(403).json({ message: "Unauthorized: You must be part of a company" });
      return;
    }

    // ✅ Fetch Employees for the User's Company
    const employees = await User.find({ company: user.user.company })
      .populate("company", "name") // ✅ Get Company Name
      .populate("role", "name permissions") // ✅ Get Role Name & Permissions
      .select("name email position department role company")
      .lean(); // ✅ Convert Mongoose Objects to Plain JSON

    // ✅ Format employee data
    const formattedEmployees = employees.map((employee) => ({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      position: employee.position,
      department: employee.department ? employee.department.toString() : "No Department",
      role: employee.role,
      company: employee.company,
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
