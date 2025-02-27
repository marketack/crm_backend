import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Role from "../models/role.model";
import User from "../models/user.model";

/**
 * 🆕 Create New Role (Admin Only)
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, permissions } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) return res.status(400).json({ message: "Role already exists" });

    const role = await Role.create({ name, permissions });

    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 📜 Get All Roles (Admin Only)
 */
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * ✏️ Update Role Permissions (Admin Only)
 */
export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;

    const role = await Role.findByIdAndUpdate(new Types.ObjectId(roleId), { permissions }, { new: true });

    if (!role) return res.status(404).json({ message: "Role not found" });

    res.json({ message: "Role updated successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * ❌ Delete Role (Admin Only)
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findByIdAndDelete(new Types.ObjectId(roleId));
    if (!role) return res.status(404).json({ message: "Role not found" });

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🔑 Assign Role to User (Admin Only)
 */

export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.body;

    // Validate ObjectId format
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(roleId)) {
      return res.status(400).json({ message: "Invalid userId or roleId format" });
    }

    const user = await User.findById(userId);
    const role = await Role.findById(roleId);

    if (!user || !role) {
      return res.status(404).json({ message: "User or Role not found" });
    }

    const roleObjectId = new Types.ObjectId(roleId); // ✅ Correct ObjectId Usage

    // Check if role already exists
    if (!user.roles.some((r) => r.equals(roleObjectId))) {
      user.roles.push(roleObjectId as Types.ObjectId);
      await user.save();
    }

    res.json({ message: "Role assigned successfully", user });
  } catch (error) {
    console.error("Error in assignRoleToUser:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🚫 Remove Role from User (Admin Only)
 */
export const removeRoleFromUser = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.body;

    const user = await User.findById(new Types.ObjectId(userId));
    if (!user) return res.status(404).json({ message: "User not found" });

    user.roles = user.roles.filter((role) => role.toString() !== roleId);
    await user.save();

    res.json({ message: "Role removed successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🚀 Assign Permission to Role (Admin Only)
 */
export const assignPermissionToRole = async (req: Request, res: Response) => {
  try {
    const { roleId, permission } = req.body;

    const role = await Role.findById(new Types.ObjectId(roleId));
    if (!role) return res.status(404).json({ message: "Role not found" });

    if (!role.permissions.includes(permission)) {
      role.permissions.push(permission);
      await role.save();
    }

    res.json({ message: "Permission assigned successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🔄 Remove Permission from Role (Admin Only)
 */
export const removePermissionFromRole = async (req: Request, res: Response) => {
  try {
    const { roleId, permission } = req.body;

    const role = await Role.findById(new Types.ObjectId(roleId));
    if (!role) return res.status(404).json({ message: "Role not found" });

    role.permissions = role.permissions.filter((p) => p !== permission);
    await role.save();

    res.json({ message: "Permission removed successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
