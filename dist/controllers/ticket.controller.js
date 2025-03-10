var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Ticket } from "../models/ticket.model";
import mongoose from "mongoose";
/** ✅ Create a Support Ticket */
export const createTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { subject, description, priority, category } = req.body;
        const ticket = new Ticket({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, // Assign to the logged-in user
            subject,
            description,
            priority: priority || "medium",
            category,
            status: "open",
        });
        yield ticket.save();
        res.status(201).json(ticket);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating ticket", error });
    }
});
/** ✅ Get All Tickets with Filters */
export const getTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { status, priority, category } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (priority)
            filter.priority = priority;
        if (category)
            filter.category = category;
        // ✅ Restrict normal users to see only their tickets
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.roles.includes("admin"))) {
            filter.user = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        }
        const tickets = yield Ticket.find(filter)
            .populate("user", "name email")
            .populate("assignedTo", "name email");
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching tickets", error });
    }
});
/** ✅ Update a Ticket */
export const updateTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const ticket = yield Ticket.findById(req.params.id);
        if (!ticket) {
            res.status(404).json({ message: "Ticket not found" });
            return;
        }
        // Ensure only Admins or the Ticket Creator can update
        if (ticket.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only update your own tickets" });
            return;
        }
        Object.assign(ticket, req.body);
        yield ticket.save();
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating ticket", error });
    }
});
/** ✅ Add a Message to a Ticket */
export const addTicketMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const ticket = yield Ticket.findById(req.params.id);
        if (!ticket) {
            res.status(404).json({ message: "Ticket not found" });
            return;
        }
        const { message } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
        if ((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin")) {
            ticket.status = "in_progress";
        }
        yield ticket.save();
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding message to ticket", error });
    }
});
/** ✅ Delete a Ticket */
export const deleteTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const ticket = yield Ticket.findById(req.params.id);
        if (!ticket) {
            res.status(404).json({ message: "Ticket not found" });
            return;
        }
        // Only allow Admins or Ticket Creators to delete
        if (ticket.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only delete your own tickets" });
            return;
        }
        yield ticket.deleteOne();
        res.json({ message: "Ticket deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting ticket", error });
    }
});
