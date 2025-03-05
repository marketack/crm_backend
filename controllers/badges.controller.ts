import { Request, Response } from "express";
import { Badge } from "../models/badges.model";

/** ✅ Create a Badge */
export const createBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, iconUrl, criteria } = req.body;

    const badge = new Badge({ name, description, iconUrl, criteria });
    await badge.save();

    res.status(201).json(badge);
  } catch (error) {
    res.status(500).json({ message: "Error creating badge", error });
  }
};

/** ✅ Get All Badges */
export const getBadges = async (_req: Request, res: Response): Promise<void> => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: "Error fetching badges", error });
  }
};

/** ✅ Update a Badge */
export const updateBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!badge) {
      res.status(404).json({ message: "Badge not found" });
      return;
    }
    res.json(badge);
  } catch (error) {
    res.status(500).json({ message: "Error updating badge", error });
  }
};

/** ✅ Delete a Badge */
export const deleteBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) {
      res.status(404).json({ message: "Badge not found" });
      return;
    }
    res.json({ message: "Badge deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting badge", error });
  }
};
