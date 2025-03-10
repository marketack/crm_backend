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
import Role from "../models/role.model";
import User from "../models/user.model";
/**
 * ✅ Convert String to ObjectId Safely
 */
const toObjectId = (id) => {
    return new mongoose.Types.ObjectId(id);
};
/**
 * 🆕 Create New Role (Admin Only)
 */
export const createRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, permissions } = req.body;
        const existingRole = yield Role.findOne({ name });
        if (existingRole) {
            res.status(400).json({ message: "Role already exists" });
            return;
        }
        const role = yield Role.create({ name, permissions });
        res.status(201).json({ message: "Role created successfully", role });
    }
    catch (error) {
        next(error);
    }
});
/**
 * 📜 Get All Roles (Admin Only)
 */
export const getAllRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield Role.find();
        res.status(200).json(roles);
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✏️ Update Role Permissions (Admin Only)
 */
export const updateRolePermissions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId } = req.params;
        const { permissions } = req.body;
        if (!mongoose.isValidObjectId(roleId)) {
            res.status(400).json({ message: "Invalid role ID format" });
            return;
        }
        const role = yield Role.findByIdAndUpdate(toObjectId(roleId), { permissions }, { new: true });
        if (!role) {
            res.status(404).json({ message: "Role not found" });
            return;
        }
        res.json({ message: "Role updated successfully", role });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ❌ Delete Role (Admin Only)
 */
export const deleteRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId } = req.params;
        if (!mongoose.isValidObjectId(roleId)) {
            res.status(400).json({ message: "Invalid role ID format" });
            return;
        }
        const role = yield Role.findByIdAndDelete(toObjectId(roleId));
        if (!role) {
            res.status(404).json({ message: "Role not found" });
            return;
        }
        res.json({ message: "Role deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
/**
 * 🔑 Assign Role to User (Admin Only)
 */
export const assignRoleToUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, roleId } = req.body;
        if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(roleId)) {
            res.status(400).json({ message: "Invalid userId or roleId format" });
            return;
        }
        const user = yield User.findById(userId);
        const role = yield Role.findById(roleId);
        if (!user || !role) {
            res.status(404).json({ message: "User or Role not found" });
            return;
        }
        if (!user.roles.some((r) => r.toString() === roleId.toString())) {
            user.roles.push(toObjectId(roleId));
            yield user.save();
        }
        res.json({ message: "Role assigned successfully", user });
    }
    catch (error) {
        next(error);
    }
});
/**
 * 🚫 Remove Role from User (Admin Only)
 */
export const removeRoleFromUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, roleId } = req.body;
        if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(roleId)) {
            res.status(400).json({ message: "Invalid userId or roleId format" });
            return;
        }
        const user = yield User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.roles = user.roles.filter((role) => role.toString() !== roleId);
        yield user.save();
        res.json({ message: "Role removed successfully", user });
    }
    catch (error) {
        next(error);
    }
});
/**
 * 🚀 Assign Permission to Role (Admin Only)
 */
export const assignPermissionToRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId, permission } = req.body;
        if (!mongoose.isValidObjectId(roleId)) {
            res.status(400).json({ message: "Invalid role ID format" });
            return;
        }
        const role = yield Role.findById(roleId);
        if (!role) {
            res.status(404).json({ message: "Role not found" });
            return;
        }
        if (!role.permissions.includes(permission)) {
            role.permissions.push(permission);
            yield role.save();
        }
        res.json({ message: "Permission assigned successfully", role });
    }
    catch (error) {
        next(error);
    }
});
/**
 * 🔄 Remove Permission from Role (Admin Only)
 */
export const removePermissionFromRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId, permission } = req.body;
        if (!mongoose.isValidObjectId(roleId)) {
            res.status(400).json({ message: "Invalid role ID format" });
            return;
        }
        const role = yield Role.findById(roleId);
        if (!role) {
            res.status(404).json({ message: "Role not found" });
            return;
        }
        role.permissions = role.permissions.filter((p) => p !== permission);
        yield role.save();
        res.json({ message: "Permission removed successfully", role });
    }
    catch (error) {
        next(error);
    }
});
