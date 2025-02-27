import { Request, Response } from "express";
import mongoose from "mongoose";
import Role from "../models/role.model";
import User from "../models/user.model";

/**
 * 🆕 Create a New Role (Admin Only)
 */
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, permissions } = req.body;

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      res.status(400).json({ message: "Role already exists" });
      return;
    }

    const role = await Role.create({ name, permissions });
    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 📜 Get All Roles (Admin Only)
 */
export const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.find();
    res.json({ message: "Roles retrieved successfully", roles });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * ✏️ Update Role Permissions (Admin Only)
 */
export const updateRolePermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;

    const role = await Role.findByIdAndUpdate(
      new mongoose.Types.ObjectId(roleId),
      { permissions },
      { new: true }
    );

    if (!role) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    res.json({ message: "Role updated successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * ❌ Delete Role (Admin Only)
 */
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId } = req.params;

    const role = await Role.findByIdAndDelete(new mongoose.Types.ObjectId(roleId));
    if (!role) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🔑 Assign Role to User (Admin Only)
 */
export const assignRoleToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, roleId } = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(roleId)) {
      res.status(400).json({ message: "Invalid userId or roleId format" });
      return;
    }

    const user = await User.findById(userId);
    const role = await Role.findById(roleId);

    if (!user || !role) {
      res.status(404).json({ message: "User or Role not found" });
      return;
    }

    const roleObjectId = new mongoose.Types.ObjectId(roleId);
    if (!user.roles.some((r) => r.toString() === roleObjectId.toString())) {
      user.roles.push(roleObjectId);
      await user.save();
    }

    res.json({ message: "Role assigned successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🚫 Remove Role from User (Admin Only)
 */
export const removeRoleFromUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, roleId } = req.body;

    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

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
export const assignPermissionToRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId, permission } = req.body;

    const role = await Role.findById(new mongoose.Types.ObjectId(roleId));
    if (!role) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

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
export const removePermissionFromRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId, permission } = req.body;

    const role = await Role.findById(new mongoose.Types.ObjectId(roleId));
    if (!role) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    role.permissions = role.permissions.filter((p) => p !== permission);
    await role.save();

    res.json({ message: "Permission removed successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
