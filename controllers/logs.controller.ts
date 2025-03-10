import { Request, Response } from "express";
import { Log } from "../models/logs.model";
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}
/** ✅ Get System Logs with Filtering */
export const getLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user, action, startDate, endDate } = req.query;

    const filter: any = {};
    if (user) filter.user = user;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }

    const logs = await Log.find(filter).populate("user", "name email");
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving logs", error });
  }
};

/** ✅ Clear System Logs (Admin-Only) */
export const clearLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Ensure only admins can clear logs
    if (!req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: Only admins can clear logs" });
      return;
    }

    await Log.deleteMany({});
    res.json({ message: "All logs have been cleared successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error clearing logs", error });
  }
};
