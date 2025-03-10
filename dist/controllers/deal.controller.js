var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Deal } from "../models/deal.model";
/** ✅ Create a Deal */
export const createDeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, amount, stage, assignedTo, customer, expectedCloseDate } = req.body;
        const deal = new Deal({
            title,
            description,
            amount,
            stage,
            assignedTo,
            customer,
            expectedCloseDate,
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, // Track deal creator
        });
        yield deal.save();
        res.status(201).json(deal);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating deal", error });
    }
});
/** ✅ Get All Deals */
export const getDeals = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deals = yield Deal.find()
            .populate("assignedTo", "name email")
            .populate("customer", "name email phone");
        res.json(deals);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching deals", error });
    }
});
/** ✅ Update a Deal */
export const updateDeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const deal = yield Deal.findById(req.params.id);
        if (!deal) {
            res.status(404).json({ message: "Deal not found" });
            return;
        }
        // Ensure the user owns the deal or is an admin/sales manager
        if (deal.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin")) && !((_c = req.user) === null || _c === void 0 ? void 0 : _c.roles.includes("sales"))) {
            res.status(403).json({ message: "Unauthorized: You can only edit your own deals" });
            return;
        }
        Object.assign(deal, req.body); // Update fields
        yield deal.save();
        res.json(deal);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating deal", error });
    }
});
/** ✅ Delete a Deal */
export const deleteDeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const deal = yield Deal.findById(req.params.id);
        if (!deal) {
            res.status(404).json({ message: "Deal not found" });
            return;
        }
        // Only allow the deal owner, an admin, or sales manager to delete
        if (deal.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin")) && !((_c = req.user) === null || _c === void 0 ? void 0 : _c.roles.includes("sales"))) {
            res.status(403).json({ message: "Unauthorized: You can only delete your own deals" });
            return;
        }
        yield deal.deleteOne();
        res.json({ message: "Deal deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting deal", error });
    }
});
