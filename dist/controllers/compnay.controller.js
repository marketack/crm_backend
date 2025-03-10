var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import Company from "../models/company.model";
import User from "../models/user.model";
/**
 * ✅ Convert ID to ObjectId safely
 */
const toObjectId = (id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
        return new mongoose.Types.ObjectId(id);
    }
    return null;
};
/**
 * ✅ Add Team Member to Company
 */
export const addTeamMember = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId, userId } = req.body;
        // ✅ Convert String IDs to ObjectId
        const companyObjectId = toObjectId(companyId);
        const userObjectId = toObjectId(userId);
        if (!companyObjectId || !userObjectId) {
            res.status(400).json({ success: false, message: "Invalid company or user ID" });
            return;
        }
        const company = yield Company.findById(companyObjectId);
        const user = yield User.findById(userObjectId);
        if (!company || !user) {
            res.status(404).json({ success: false, message: "Company or User not found" });
            return;
        }
        // ✅ Ensure the user is not already in the team
        if (!company.team.some((memberId) => memberId.equals(userObjectId))) {
            company.team.push(userObjectId);
            yield company.save();
            yield User.findByIdAndUpdate(userObjectId, { company: companyObjectId });
        }
        res.status(200).json({ success: true, message: "User added to company team", company });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Create Company Profile
 */
export const createCompany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email, phone, industry, website, address, aboutUs } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ success: false, message: "User ID is required" });
            return;
        }
        if (!name || !email || !phone || !industry) {
            res.status(400).json({
                success: false,
                message: "Missing required fields: name, email, phone, and industry are required",
            });
            return;
        }
        const existingCompany = yield Company.findOne({ email });
        if (existingCompany) {
            res.status(400).json({ success: false, message: "Company already exists with this email" });
            return;
        }
        // ✅ Ensure `aboutUs` is set
        const company = new Company({
            name,
            email,
            phone,
            industry,
            website,
            address,
            aboutUs: aboutUs || "No description available.",
            createdBy: toObjectId(userId),
            updatedBy: toObjectId(userId),
            contactUs: {
                email,
                phone,
            },
        });
        yield company.save();
        yield User.findByIdAndUpdate(userId, { company: company._id });
        res.status(201).json({ success: true, message: "Company created successfully", company });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Get All Companies
 */
export const getAllCompanies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companies = yield Company.find();
        res.status(200).json({ success: true, companies });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Update Company Details
 */
export const updateCompany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        const updates = req.body;
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            res.status(400).json({ success: false, message: "Invalid company ID" });
            return;
        }
        const company = yield Company.findByIdAndUpdate(toObjectId(companyId), updates, { new: true });
        if (!company) {
            res.status(404).json({ success: false, message: "Company not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Company updated successfully", company });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ❌ Delete Company (Soft Delete)
 */
export const deleteCompany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            res.status(400).json({ success: false, message: "Invalid company ID" });
            return;
        }
        const company = yield Company.findByIdAndUpdate(toObjectId(companyId), { isDeleted: true }, { new: true });
        if (!company) {
            res.status(404).json({ success: false, message: "Company not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Company deleted (soft delete)", company });
    }
    catch (error) {
        next(error);
    }
});
