var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Lead } from "../models/lead.model";
import { calculateLeadScore } from "../utils/lead.utils"; // AI-powered lead scoring
/** ✅ Create a Lead */
export const createLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, // Track lead creator
        });
        yield lead.save();
        res.status(201).json(lead);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating lead", error });
    }
});
/** ✅ Get All Leads with Filters */
export const getLeads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, source, assignedTo } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (source)
            filter.source = source;
        if (assignedTo)
            filter.assignedTo = assignedTo;
        const leads = yield Lead.find(filter)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");
        res.json(leads);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching leads", error });
    }
});
/** ✅ Update a Lead */
export const updateLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const lead = yield Lead.findById(req.params.id);
        if (!lead) {
            res.status(404).json({ message: "Lead not found" });
            return;
        }
        // Ensure only the assigned sales rep, lead owner, or admin can update
        if (lead.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) &&
            ((_b = lead.assignedTo) === null || _b === void 0 ? void 0 : _b.toString()) !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId) &&
            !((_d = req.user) === null || _d === void 0 ? void 0 : _d.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only update your assigned leads" });
            return;
        }
        Object.assign(lead, req.body);
        // Recalculate lead score based on new engagement data
        if (req.body.engagementScore) {
            lead.leadScore = calculateLeadScore(req.body.engagementScore);
        }
        yield lead.save();
        res.json(lead);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating lead", error });
    }
});
/** ✅ Delete a Lead */
export const deleteLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const lead = yield Lead.findById(req.params.id);
        if (!lead) {
            res.status(404).json({ message: "Lead not found" });
            return;
        }
        // Only allow admins or lead owners to delete
        if (lead.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only delete your own leads" });
            return;
        }
        yield lead.deleteOne();
        res.json({ message: "Lead deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting lead", error });
    }
});
