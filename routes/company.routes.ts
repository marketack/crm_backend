import { Router } from "express";
import asyncHandler from "express-async-handler"; // ✅ Import error-handling wrapper
import {
  createCompanyWithDepartments,
  getAllCompanies,
  updateCompany,
  deleteCompany,
  getCompanyDepartments,
  addDepartmentToCompany,
  updateDepartment,
  deleteDepartment,
} from "../controllers/compnay.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware"; // ✅ Role-based access

const router = Router();

// ✅ Company Routes
router.post("/", verifyJWT, requireRole(["admin", "customer","owner"]), asyncHandler(createCompanyWithDepartments)); // ✅ Create company
router.get("/", verifyJWT, asyncHandler(getAllCompanies)); // ✅ View all companies
router.put("/:companyId", verifyJWT, requireRole(["admin", "customer","owner"]), asyncHandler(updateCompany)); // ✅ Update company
router.delete("/:companyId", verifyJWT, requireRole(["admin", "customer","owner"]), asyncHandler(deleteCompany)); // ✅ Delete company

// ✅ Department Routes
router.get("/:companyId/departments", verifyJWT, asyncHandler(getCompanyDepartments)); // ✅ Get departments
router.post("/:companyId/departments", verifyJWT, requireRole(["admin", "customer","owner"]), asyncHandler(addDepartmentToCompany)); // ✅ Add department
router.put("/:companyId/departments/:departmentId", verifyJWT, requireRole(["admin", "customer","owner"]), asyncHandler(updateDepartment)); // ✅ Update department
router.delete("/:companyId/departments/:departmentId", verifyJWT, requireRole(["admin", "customer","owner"]), asyncHandler(deleteDepartment)); // ✅ Delete department

export default router;
