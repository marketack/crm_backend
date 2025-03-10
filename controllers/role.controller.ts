import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Role from "../models/role.model";

/**
 * ✅ Create a New Role
 */
export const createRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, permissions } = req.body;

  if (!name || !permissions) {
    res.status(400).json({ success: false, message: "Role name and permissions are required" });
    return;
  }

  try {
    const role = new Role({ name, permissions });
    await role.save();

    res.status(201).json({ success: true, message: "Role created successfully", role });
  } catch (error) {
    console.error("❌ Error creating role:", error);
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
});

/**
 * ✅ Get All Roles
 */
export const getAllRoles = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.find().populate("permissions");
    res.json({ success: true, roles });
  } catch (error) {
    console.error("❌ Error fetching roles:", error);
    res.status(500).json({ success: false, message: "Failed to fetch roles", error });
  }
});

/**
 * ✅ Update Role Permissions
 */
export const updateRolePermissions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { roleId } = req.params;
  const { permissions } = req.body;

  if (!permissions) {
    res.status(400).json({ success: false, message: "Permissions are required" });
    return;
  }

  try {
    const updatedRole = await Role.findByIdAndUpdate(roleId, { permissions }, { new: true });

    if (!updatedRole) {
      res.status(404).json({ success: false, message: "Role not found" });
      return;
    }

    res.json({ success: true, message: "Role updated successfully", role: updatedRole });
  } catch (error) {
    console.error("❌ Error updating role:", error);
    res.status(500).json({ success: false, message: "Failed to update role", error });
  }
});

/**
 * ✅ Delete a Role
 */
export const deleteRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { roleId } = req.params;

  try {
    const deletedRole = await Role.findByIdAndDelete(roleId);

    if (!deletedRole) {
      res.status(404).json({ success: false, message: "Role not found" });
      return;
    }

    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting role:", error);
    res.status(500).json({ success: false, message: "Failed to delete role", error });
  }
});
