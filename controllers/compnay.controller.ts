import { Request, Response, NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import asyncHandler from "express-async-handler"; // ✅ Error handling wrapper
import Company from "../models/company.model";
import User from "../models/user.model"; // ✅ Import User model
import Role from "../models/role.model"; // ✅ Import User model

// ✅ Convert String to ObjectId safely
const toObjectId = (id: any): Types.ObjectId | null => {
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
};

/**
 * ✅ Default Departments Template
 */
const DEFAULT_DEPARTMENTS = [
  { name: "Human Resources", budget: 50000, objectives: ["Employee Management", "Recruitment"] },
  { name: "Finance", budget: 100000, objectives: ["Budget Planning", "Financial Reporting"] },
  { name: "Marketing", budget: 80000, objectives: ["Brand Awareness", "Lead Generation"] },
  { name: "Sales", budget: 120000, objectives: ["Increase Revenue", "Client Acquisition"] },
  { name: "IT", budget: 150000, objectives: ["System Security", "Infrastructure Maintenance"] },
];

/**
 * ✅ Create a Company with Default Departments
 */
export const createCompanyWithDepartments = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log("📡 Incoming Create Company Request:", req.body);

    const { name, email, phone, industry, website, address, aboutUs, createdBy, departments, contactUs } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !phone || !industry || !contactUs || !contactUs.phone || !contactUs.email) {
      console.log("❌ Missing required fields");
      res.status(400).json({ success: false, message: "Company name, email, phone, industry, and contact details are required" });
      return;
    }

    // ✅ Convert `createdBy` to ObjectId safely
    const createdByObjectId = toObjectId(createdBy);
    if (!createdByObjectId) {
      console.log("❌ Invalid CreatedBy User ID");
      res.status(400).json({ success: false, message: "Invalid CreatedBy User ID" });
      return;
    }

    // ✅ Fetch user and ensure they exist
    const user = await User.findById(createdByObjectId).populate("role", "name").lean();
    if (!user) {
      console.log("❌ User not found");
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // ✅ Ensure proper role assignment
    const userRole = user.role && typeof user.role === "object" && "name" in user.role ? user.role.name.toLowerCase() : "";

    if (userRole !== "owner") {
      const ownerRole = await Role.findOne({ name: "owner" }).select("_id").lean();
      if (!ownerRole) {
        console.error("❌ Role 'owner' does not exist in the database.");
        res.status(500).json({ success: false, message: "Owner role not found." });
        return;
      }

      // ✅ Update user role
      await User.findByIdAndUpdate(createdByObjectId, { role: ownerRole._id });
    }

    // ✅ Process departments or use default ones
    const assignedDepartments = departments?.length
      ? departments.map((dept: any) => ({
          name: dept.name,
          employees: dept.employees ? dept.employees.map(toObjectId).filter(Boolean) : [],
          budget: dept.budget || 0,
          objectives: dept.objectives || [],
        }))
      : DEFAULT_DEPARTMENTS.map((dept) => ({
          name: dept.name,
          employees: [],
          budget: dept.budget,
          objectives: dept.objectives,
        }));

    // ✅ Create Company with Proper Employee ObjectIds
    const company = await new Company({
      name,
      email,
      phone,
      industry,
      website,
      address,
      aboutUs,
      createdBy: createdByObjectId,
      updatedBy: createdByObjectId,
      employees: [createdByObjectId], // ✅ Only store ObjectId, not an object
      departments: assignedDepartments,
      contactUs: { phone: contactUs.phone, email: contactUs.email },
    }).save();

    if (!company || !company._id) {
      console.error("❌ Failed to create company.");
      res.status(500).json({ success: false, message: "Error creating company." });
      return;
    }

    // ✅ Assign company to user
    await User.findByIdAndUpdate(createdByObjectId, {
      company: company._id,
      department: null,
      position: "CEO",
    });

    console.log("✅ Company created successfully:", company);
    res.status(201).json({ success: true, message: "Company created successfully", company });

  } catch (error) {
    console.error("❌ Error creating company:", error);
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
});

export const getAllCompanies = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📡 Fetching companies for user:", (req as any).user?.userId);

    if (!(req as any).user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    // ✅ If the user is an admin, return all companies
    if ((req as any).user.roles.includes("admin")) {
      console.log("✅ Admin access: Returning all companies");
      const companies = await Company.find().lean();
      res.status(200).json({ success: true, companies });
      return;
    }

    // ✅ Ensure user has a company
    if (!(req as any).user.company) {
      res.status(403).json({ success: false, message: "You do not belong to a company." });
      return;
    }

    const company = await Company.findById((req as any).user.company).lean();
    if (!company) {
      res.status(404).json({ success: false, message: "Company not found." });
      return;
    }

    console.log("✅ Returning user's company:", company.name);
    res.status(200).json({ success: true, company });
  } catch (error) {
    console.error("❌ Error fetching company:", error);
    res.status(500).json({ success: false, message: "Error fetching company", error });
  }
});

/**
 * ✅ Update Company Details
 */
export const updateCompany = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      res.status(400).json({ success: false, message: "Invalid company ID" });
      return;
    }

    if (!(req as any).user.company) {
      res.status(403).json({ success: false, message: "You do not belong to a company." });
      return;
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      updates,
      { new: true }
    );

    if (!company) {
      res.status(404).json({ success: false, message: "Company not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Company updated successfully", company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating company", error });
  }
});


/** ✅ Delete a Company */
export const deleteCompany = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    // ✅ Validate company ID
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      res.status(400).json({ success: false, message: "Invalid company ID" });
      return;
    }

    // ✅ Ensure the user belongs to a company
    if (!(req as any).user.company) {
      res.status(403).json({ success: false, message: "You do not belong to a company." });
      return;
    }

    // ✅ Find the company and its owner
    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).json({ success: false, message: "Company not found" });
      return;
    }

    // ✅ Fetch the owner of the company
    const owner = await User.findById(company.createdBy);
    if (!owner) {
      res.status(404).json({ success: false, message: "Owner not found" });
      return;
    }

    // ✅ Fetch the default "customer" role
    const customerRole = await Role.findOne({ name: "customer" }).lean();
    if (!customerRole || !customerRole._id) {
      res.status(500).json({ success: false, message: "Default role 'customer' not found" });
      return;
    }

    // ✅ Revert the owner's role to "customer"
    owner.role = new mongoose.Types.ObjectId(customerRole._id.toString());
    owner.company = null; // ✅ Remove the company association
    owner.position = null; // ✅ Clear position
    owner.department = null; // ✅ Clear department
    owner.salary = null; // ✅ Clear salary
    owner.reportsTo = null; // ✅ Clear reportsTo
    await owner.save();

    // ✅ Remove all employees from the company
    await User.updateMany(
      { company: companyId },
      {
        $set: {
          role: new mongoose.Types.ObjectId(customerRole._id.toString()), // ✅ Assign "customer" role
          company: null, // ✅ Remove company association
          position: null, // ✅ Clear position
          department: null, // ✅ Clear department
          salary: null, // ✅ Clear salary
          reportsTo: null, // ✅ Clear reportsTo
        },
      }
    );

    // ✅ Delete the company
    await Company.findByIdAndDelete(companyId);

    res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting company", error });
  }
});

/** ✅ Add a New Department to a Company */
/**
 * ✅ Add a New Department to a Company (Fixing Missing Fields)
 */
export const addDepartmentToCompany = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { name, employees, budget, objectives } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: "Department name is required" });
      return;
    }

    const companyObjectId = toObjectId(companyId);
    if (!companyObjectId) {
      res.status(400).json({ success: false, message: "Invalid company ID" });
      return;
    }

    const company = await Company.findById(companyObjectId);
    if (!company) {
      res.status(404).json({ success: false, message: "Company not found" });
      return;
    }

    const newDepartment = {
      _id: new Types.ObjectId(),
      name,
      employees: employees ? employees.map(toObjectId).filter(Boolean) : [],
      budget: budget || 0, // ✅ Ensure budget exists
      objectives: objectives || [], // ✅ Ensure objectives exist
    };

    company.departments.push(newDepartment);
    await company.save();

    res.status(201).json({ success: true, message: "Department added successfully", department: newDepartment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding department", error });
  }
});
/**
 * ✅ Get All Departments for a Company
 */
export const getCompanyDepartments = asyncHandler(async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const companyObjectId = toObjectId(companyId);

  if (!companyObjectId) {
    res.status(400).json({ success: false, message: "Invalid company ID" });
    return;
  }

  const company = await Company.findById(companyObjectId, "departments");

  if (!company) {
    res.status(404).json({ success: false, message: "Company not found" });
    return;
  }

  res.status(200).json({ success: true, departments: company.departments });
});


/** ✅ Delete a Department */
export const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { companyId, departmentId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).json({ success: false, message: "Company not found" });
      return;
    }

    company.departments = company.departments.filter((dept) => dept._id?.toString() !== departmentId);
    await company.save();

    res.status(200).json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting department", error });
  }
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { companyId, departmentId } = req.params;
  const updates = req.body;

  const companyObjectId = toObjectId(companyId);
  if (!companyObjectId) {
    res.status(400).json({ success: false, message: "Invalid company ID" });
    return;
  }

  const company = await Company.findById(companyObjectId);
  if (!company) {
    res.status(404).json({ success: false, message: "Company not found" });
    return;
  }

  const department = company.departments.find((dept) => dept._id?.toString() === departmentId);
  if (!department) {
    res.status(404).json({ success: false, message: "Department not found" });
    return;
  }

  Object.assign(department, updates);
  await company.save();

  res.status(200).json({ success: true, message: "Department updated successfully", department });
});
