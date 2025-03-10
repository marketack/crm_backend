import { Request, Response } from "express";
import { Ticket } from "../models/ticket.model";
import mongoose from "mongoose";
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}
/** ✅ Create a Support Ticket */
export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, description, priority, category } = req.body;

    const ticket = new Ticket({
      user: req.user?.userId, // Assign to the logged-in user
      subject,
      description,
      priority: priority || "medium",
      category,
      status: "open",
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error creating ticket", error });
  }
};

/** ✅ Get All Tickets with Filters */
export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, category } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // ✅ Restrict normal users to see only their tickets
    if (!req.user?.roles.includes("admin")) {
      filter.user = req.user?.userId;
    }

    const tickets = await Ticket.find(filter)
      .populate("user", "name email")
      .populate("assignedTo", "name email");

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error });
  }
};

/** ✅ Update a Ticket */
export const updateTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }

    // Ensure only Admins or the Ticket Creator can update
    if (ticket.user.toString() !== req.user?.userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: You can only update your own tickets" });
      return;
    }

    Object.assign(ticket, req.body);
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error updating ticket", error });
  }
};

/** ✅ Add a Message to a Ticket */
export const addTicketMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        res.status(404).json({ message: "Ticket not found" });
        return;
      }
  
      const { message } = req.body;
      const userId = req.user?.userId;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
      }
  
      // ✅ Convert user ID to ObjectId before adding to messages array
      ticket.messages.push({
        sender: new mongoose.Types.ObjectId(userId),
        content: message,
        timestamp: new Date(),
      });
  
      // ✅ Auto-update status if an admin responds
      if (req.user?.roles.includes("admin")) {
        ticket.status = "in_progress";
      }
  
      await ticket.save();
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Error adding message to ticket", error });
    }
  };

/** ✅ Delete a Ticket */
export const deleteTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }

    // Only allow Admins or Ticket Creators to delete
    if (ticket.user.toString() !== req.user?.userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: You can only delete your own tickets" });
      return;
    }

    await ticket.deleteOne();
    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting ticket", error });
  }
};
