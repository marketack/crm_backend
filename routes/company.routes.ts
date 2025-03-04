import express from "express";
import {
  createCompany,
  getAllCompanies,
  addTeamMember,
  updateCompany,
  deleteCompany,
} from "../controllers/compnay.controller"; // ✅ Fixed Import Name

import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ Ensure handlers return `void`
router.post("/", verifyJWT, (req, res, next) => createCompany(req, res, next).catch(next));
router.get("/", verifyJWT, (req, res, next) => getAllCompanies(req, res, next).catch(next));
router.post("/add-staff", verifyJWT, requireRole(["owner", "staff"]), (req, res, next) => addTeamMember(req, res, next).catch(next));
router.put("/:companyId", verifyJWT, requireRole(["owner", "staff"]), (req, res, next) => updateCompany(req, res, next).catch(next));
router.delete("/:companyId", verifyJWT, requireRole(["owner", "staff"]), (req, res, next) => deleteCompany(req, res, next).catch(next));

export default router;
