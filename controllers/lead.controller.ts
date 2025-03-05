import { Request, Response } from "express";
import { Lead } from "../models/lead.model";
import { calculateLeadScore } from "../utils/lead.utils"; // AI-powered lead scoring

/** ✅ Create a Lead */
export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, source, assignedTo, status, engagementScore } = req.body;

    const lead = new Lead({
      name,
      email,
      phone,
      source,
      assignedTo,
      status: status || "new",
      engagementScore: engagementScore || 50, // Default engagement score
      leadScore: calculateLeadScore(engagementScore), // AI-powered lead score
      createdBy: req.user?.userId, // Track lead creator
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Error creating lead", error });
  }
};

/** ✅ Get All Leads with Filters */
export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, source, assignedTo } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leads", error });
  }
};

/** ✅ Update a Lead */
export const updateLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    // Ensure only the assigned sales rep, lead owner, or admin can update
    if (
      lead.createdBy.toString() !== req.user?.userId &&
      lead.assignedTo?.toString() !== req.user?.userId &&
      !req.user?.roles.includes("admin")
    ) {
      res.status(403).json({ message: "Unauthorized: You can only update your assigned leads" });
      return;
    }

    Object.assign(lead, req.body);

    // Recalculate lead score based on new engagement data
    if (req.body.engagementScore) {
      lead.leadScore = calculateLeadScore(req.body.engagementScore);
    }

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Error updating lead", error });
  }
};

/** ✅ Delete a Lead */
export const deleteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    // Only allow admins or lead owners to delete
    if (lead.createdBy.toString() !== req.user?.userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: You can only delete your own leads" });
      return;
    }

    await lead.deleteOne();
    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting lead", error });
  }
};
