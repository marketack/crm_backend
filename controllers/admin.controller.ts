import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Role from "../models/role.model";
import User from "../models/user.model";
import Subscription from "../models/subscription.model";

/**
 * ✅ Convert String to ObjectId Safely
 */
const toObjectId = (id: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

/**
 * 🆕 Create New Role (Admin Only)
 */
export const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    next(error);
  }
};

/**
 * 📜 Get All Roles (Admin Only)
 */
export const getAllRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

/**
 * ✏️ Update Role Permissions (Admin Only)
 */
export const updateRolePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;

    if (!mongoose.isValidObjectId(roleId)) {
      res.status(400).json({ message: "Invalid role ID format" });
      return;
    }

    const role = await Role.findByIdAndUpdate(toObjectId(roleId), { permissions }, { new: true });

    if (!role) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    res.json({ message: "Role updated successfully", role });
  } catch (error) {
    next(error);
  }
};

/**
 * ❌ Delete Role (Admin Only)
 */
export const deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roleId } = req.params;

    if (!mongoose.isValidObjectId(roleId)) {
      res.status(400).json({ message: "Invalid role ID format" });
      return;
    }

    const role = await Role.findByIdAndDelete(toObjectId(roleId));
    if (!role) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔑 Assign Role to User (Admin Only)
 */
export const assignRoleToUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    if (!user.roles.some((r) => r.toString() === roleId.toString())) {
      user.roles.push(toObjectId(roleId));
      await user.save();
    }

    res.json({ message: "Role assigned successfully", user });
  } catch (error) {
    next(error);
  }
};

/**
 * 🚫 Remove Role from User (Admin Only)
 */
export const removeRoleFromUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, roleId } = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(roleId)) {
      res.status(400).json({ message: "Invalid userId or roleId format" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.roles = user.roles.filter((role) => role.toString() !== roleId);
    await user.save();

    res.json({ message: "Role removed successfully", user });
  } catch (error) {
    next(error);
  }
};

/**
 * 🚀 Assign Permission to Role (Admin Only)
 */
export const assignPermissionToRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roleId, permission } = req.body;

    if (!mongoose.isValidObjectId(roleId)) {
      res.status(400).json({ message: "Invalid role ID format" });
      return;
    }

    const role = await Role.findById(roleId);
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
    next(error);
  }
};

/**
 * 🔄 Remove Permission from Role (Admin Only)
 */
export const removePermissionFromRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roleId, permission } = req.body;

    if (!mongoose.isValidObjectId(roleId)) {
      res.status(400).json({ message: "Invalid role ID format" });
      return;
    }

    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({ message: "Role not found" });
      return;
    }

    role.permissions = role.permissions.filter((p) => p !== permission);
    await role.save();

    res.json({ message: "Permission removed successfully", role });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get All Users
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get User By ID
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      res.status(400).json({ message: "Invalid user ID format" });
      return;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscriptions = await Subscription.find().populate("user saasTool");
    res.json({ message: "All subscriptions retrieved", subscriptions });
    return; // ✅ Fix: Explicitly return void
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscriptions", error });
    return; // ✅ Fix: Ensure function returns void
  }
};

/**
 * ✅ Manually update subscription status
 */
export const updateSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    const { status } = req.body;

    if (!["active", "canceled", "expired"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return; // ✅ Fix: Ensure function returns void
    }

    const updatedSubscription = await Subscription.findByIdAndUpdate(subscriptionId, { status }, { new: true });

    if (!updatedSubscription) {
      res.status(404).json({ message: "Subscription not found" });
      return; // ✅ Fix: Ensure function returns void
    }

    res.json({ message: `Subscription ${status} successfully`, updatedSubscription });
    return; // ✅ Fix: Explicit return
  } catch (error) {
    res.status(500).json({ message: "Error updating subscription status", error });
    return; // ✅ Fix: Ensure function returns void
  }
};