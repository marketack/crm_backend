import { Request, Response } from "express";
import SaaSTool from "../models/saasTool.model";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}
/**
 * Get all SaaS tools (Public)
 */
export const getSaaSTools = async (req: AuthRequest, res: Response) => {
  try {
    const tools = await SaaSTool.find();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: "Error fetching SaaS tools", error });
  }
};

/**
 * Get a single SaaS tool (Public)
 */
export const getSaaSToolById = async (req: Request, res: Response) => {
  try {
    const tool = await SaaSTool.findById(req.params.toolId);
    if (!tool) return res.status(404).json({ message: "SaaS tool not found" });

    res.json(tool);
  } catch (error) {
    res.status(500).json({ message: "Error fetching SaaS tool", error });
  }
};

/**
 * Create a new SaaS tool (Admin Only)
 */
export const createSaaSTool = async (req: AuthRequest, res: Response)=> {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { name, description, price, url } = req.body;
    const tool = new SaaSTool({ name, description, price, url, createdBy: req.user.userId });
    await tool.save();

    res.status(201).json({ message: "SaaS tool created", tool });
  } catch (error) {
    res.status(400).json({ message: "Error creating SaaS tool", error });
  }
};

/**
 * Update a SaaS tool (Admin Only)
 */
export const updateSaaSTool = async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params;
    const updatedTool = await SaaSTool.findByIdAndUpdate(toolId, req.body, { new: true });

    if (!updatedTool) return res.status(404).json({ message: "SaaS tool not found" });

    res.json({ message: "SaaS tool updated", updatedTool });
  } catch (error) {
    res.status(400).json({ message: "Error updating SaaS tool", error });
  }
};

/**
 * Delete a SaaS tool (Admin Only)
 */
export const deleteSaaSTool = async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params;
    const deletedTool = await SaaSTool.findByIdAndDelete(toolId);

    if (!deletedTool) return res.status(404).json({ message: "SaaS tool not found" });

    res.json({ message: "SaaS tool deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting SaaS tool", error });
  }
};
