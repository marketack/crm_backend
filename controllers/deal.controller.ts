import { Request, Response } from "express";
import mongoose from "mongoose";
import { Deal } from "../models/deal.model";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}

/** ✅ Create a Deal */
export const createDeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, amount, stage, assignedTo, customer, expectedCloseDate } = req.body;

    // ✅ Validate required fields
    if (!title || !amount || !stage || !customer || !assignedTo) {
      console.error("Validation Error: Missing required fields", req.body); // Log request body
      res.status(400).json({ message: "Missing required fields: title, amount, stage, customer, or assignedTo" });
      return;
    }

    // ✅ Ensure customer and assignedTo are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(customer)) {
      console.error("Invalid customer ID format:", customer);
      res.status(400).json({ message: "Invalid customer ID format" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      console.error("Invalid assignedTo ID format:", assignedTo);
      res.status(400).json({ message: "Invalid assignedTo ID format" });
      return;
    }

    const deal = new Deal({
      title,
      description,
      amount,
      stage,
      assignedTo,
      customer,
      expectedCloseDate,
      createdBy: req.user?.userId,
    });

    await deal.save();
    res.status(201).json(deal);
  } catch (error) {
    console.error("Error creating deal:", error);
    res.status(500).json({ message: "Error creating deal", error: error.message || error });
  }
};


/** ✅ Get All Deals */
export const getDeals = async (_req: Request, res: Response): Promise<void> => {
  try {
    const deals = await Deal.find()
      .populate("assignedTo", "name email")
      .populate("customer", "name email phone");
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching deals", error });
  }
};

/** ✅ Update a Deal */
export const updateDeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      res.status(404).json({ message: "Deal not found" });
      return;
    }

    // Ensure the user owns the deal or is an admin/sales manager
    if (deal.createdBy.toString() !== req.user?.userId && !req.user?.roles.includes("admin") && !req.user?.roles.includes("sales")) {
      res.status(403).json({ message: "Unauthorized: You can only edit your own deals" });
      return;
    }

    Object.assign(deal, req.body); // Update fields
    await deal.save();

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: "Error updating deal", error });
  }
};

/** ✅ Delete a Deal */
export const deleteDeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      res.status(404).json({ message: "Deal not found" });
      return;
    }

    // Only allow the deal owner, an admin, or sales manager to delete
    if (deal.createdBy.toString() !== req.user?.userId && !req.user?.roles.includes("admin") && !req.user?.roles.includes("sales")) {
      res.status(403).json({ message: "Unauthorized: You can only delete your own deals" });
      return;
    }

    await deal.deleteOne();
    res.json({ message: "Deal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting deal", error });
  }
};
