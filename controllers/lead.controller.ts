import { Request, Response } from "express";
import { Lead } from "../models/lead.model";
import { calculateLeadScore } from "../utils/lead.utils"; // AI-powered lead scoring
import mongoose from "mongoose";
import { Customer } from "../models/customer.model";
import { ActivityLog } from "../models/activityLog.model";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}

/** ✅ Create a New Lead */
export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, source, assignedTo, status, engagementScore } = req.body;

    if (!name || !email || !phone || !source) {
      res.status(400).json({ message: "Missing required fields: name, email, phone, and source are required." });
      return;
    }

    const lead = new Lead({
      name,
      email,
      phone,
      source,
      assignedTo: assignedTo || null,
      status: status || "new",
      engagementScore: engagementScore ?? 50, // Default engagement score
      leadScore: calculateLeadScore(engagementScore ?? 50), // AI-powered lead score
      createdBy: req.user?.userId, // Track lead creator
    });

    await lead.save();
    res.status(201).json({ message: "Lead created successfully", lead });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ message: "Error creating lead", error: error.message });
  }
};

/** ✅ Get All Leads with Filters */
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, source, assignedTo } = req.query;

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json({ message: "Leads retrieved successfully", leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Error fetching leads", error: error.message });
  }
};

/** ✅ Update a Lead */
export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: "Invalid lead ID" });
      return;
    }

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
    if (req.body.engagementScore !== undefined) {
      lead.leadScore = calculateLeadScore(req.body.engagementScore);
    }

    await lead.save();
    res.json({ message: "Lead updated successfully", lead });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Error updating lead", error: error.message });
  }
};

/** ✅ Delete a Lead */
export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: "Invalid lead ID" });
      return;
    }

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
    console.error("Error deleting lead:", error);
    res.status(500).json({ message: "Error deleting lead", error: error.message });
  }
};

export const convertLeadToCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      res.status(400).json({ message: "Invalid lead ID" });
      return;
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    // Create a new customer from lead data
    const customer = new Customer({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      country: lead.country,
      zipCode: lead.zipCode,
      website: lead.website,
      customerValue: lead.leadValue,
      assignedTo: lead.assignedTo || req.user?.userId,
      createdBy: req.user?.userId,
    });

    await customer.save();
    
    // Delete the lead after conversion
    await lead.deleteOne();

    // Log the conversion in the activity log
    await ActivityLog.create({
      user: req.user?.userId,
      action: "Converted Lead to Customer",
      targetType: "lead",
      targetId: lead._id,
    });

    res.status(201).json({ message: "Lead successfully converted to Customer", customer });
  } catch (error) {
    console.error("Error converting lead to customer:", error);
    res.status(500).json({ message: "Error converting lead", error: error.message });
  }
};