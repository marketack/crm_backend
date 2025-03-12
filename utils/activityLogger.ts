import { ActivityLog } from "../models/activityLog.model";
import { Request } from "express";

/**
 * ✅ Logs an activity for any action in the CRM system.
 * @param req Express request object (used for IP address tracking)
 * @param userId User performing the action
 * @param userRole Role of the user (admin, sales, etc.)
 * @param action Action taken (e.g., "Updated Deal")
 * @param targetType Type of entity affected (lead, customer, deal, invoice, etc.)
 * @param targetId ID of the affected entity
 * @param details Optional description of what was changed
 */
export const logActivity = async (
  req: Request,
  userId: string,
  userRole: string,
  action: string,
  targetType: "lead" | "customer" | "deal" | "invoice" | "task" | "contact" | "note" | "email" | "call",
  targetId: string,
  details?: string
) => {
  try {
    await ActivityLog.create({
      userId,
      userRole,
      action,
      targetType,
      targetId,
      details,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "Unknown",
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
