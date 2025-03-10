var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Badge } from "../models/badges.model";
/** ✅ Create a Badge */
export const createBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, iconUrl, criteria } = req.body;
        const badge = new Badge({ name, description, iconUrl, criteria });
        yield badge.save();
        res.status(201).json(badge);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating badge", error });
    }
});
/** ✅ Get All Badges */
export const getBadges = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const badges = yield Badge.find();
        res.json(badges);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching badges", error });
    }
});
/** ✅ Update a Badge */
export const updateBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const badge = yield Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!badge) {
            res.status(404).json({ message: "Badge not found" });
            return;
        }
        res.json(badge);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating badge", error });
    }
});
/** ✅ Delete a Badge */
export const deleteBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const badge = yield Badge.findByIdAndDelete(req.params.id);
        if (!badge) {
            res.status(404).json({ message: "Badge not found" });
            return;
        }
        res.json({ message: "Badge deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting badge", error });
    }
});
