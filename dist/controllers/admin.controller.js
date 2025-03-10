var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import User from "../models/user.model";
import Subscription from "../models/subscription.model";
/**
 * ✅ Convert String to ObjectId Safely
 */
const toObjectId = (id) => {
    return new mongoose.Types.ObjectId(id);
};
/**
 * ✅ Get All Users
 */
export const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User.find().select("-password");
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Get User By ID
 */
export const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!mongoose.isValidObjectId(userId)) {
            res.status(400).json({ message: "Invalid user ID format" });
            return;
        }
        const user = yield User.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
export const getAllSubscriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscriptions = yield Subscription.find().populate("user saasTool");
        res.json({ message: "All subscriptions retrieved", subscriptions });
        return; // ✅ Fix: Explicitly return void
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching subscriptions", error });
        return; // ✅ Fix: Ensure function returns void
    }
});
/**
 * ✅ Manually update subscription status
 */
export const updateSubscriptionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subscriptionId } = req.params;
        const { status } = req.body;
        if (!["active", "canceled", "expired"].includes(status)) {
            res.status(400).json({ message: "Invalid status" });
            return; // ✅ Fix: Ensure function returns void
        }
        const updatedSubscription = yield Subscription.findByIdAndUpdate(subscriptionId, { status }, { new: true });
        if (!updatedSubscription) {
            res.status(404).json({ message: "Subscription not found" });
            return; // ✅ Fix: Ensure function returns void
        }
        res.json({ message: `Subscription ${status} successfully`, updatedSubscription });
        return; // ✅ Fix: Explicit return
    }
    catch (error) {
        res.status(500).json({ message: "Error updating subscription status", error });
        return; // ✅ Fix: Ensure function returns void
    }
});
