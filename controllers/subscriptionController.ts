import { Request, Response } from "express";
import Subscription from "../models/subscription.model";
import SaaSTool from "../models/saasTool.model";
import Notification from "../models/notification.model";

// ✅ Define a custom request type to include `user`
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}

/**
 * ✅ Get all subscriptions of a user
 */
export const getUserSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const subscriptions = await Subscription.find({ user: userId })
      .populate("saasTool")
      .lean();

    res.json({ message: "User subscriptions retrieved!", subscriptions });
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscriptions", error });
  }
};


/**
 * ✅ Subscribe a user to a SaaS tool with validation
 */
export const subscribeToTool = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { toolId } = req.params;
    const { plan, billingCycle } = req.body;

    const tool = await SaaSTool.findById(toolId);
    if (!tool) return res.status(404).json({ message: "Tool not found" });

    // ✅ Prevent duplicate subscriptions
    const existingSubscription = await Subscription.findOne({
      user: userId,
      saasTool: toolId,
      status: "active"
    });

    if (existingSubscription) {
      return res.status(400).json({ message: "Already subscribed to this tool" });
    }

    // ✅ Define pricing (adjust based on plan)
    const pricing = {
      basic: { monthly: 10, yearly: 100 },
      premium: { monthly: 25, yearly: 250 },
      enterprise: { monthly: 50, yearly: 500 }
    };

    if (!pricing[plan] || !pricing[plan][billingCycle]) {
      return res.status(400).json({ message: "Invalid plan or billing cycle" });
    }

    const price = pricing[plan][billingCycle];

    // ✅ Create subscription with expiry logic
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + (billingCycle === "monthly" ? 1 : 12));

    const subscription = new Subscription({
      user: userId,
      saasTool: toolId,
      plan,
      status: "active",
      startDate,
      expiryDate,
      price,
      billingCycle,
      autoRenew: true,
    });

    await subscription.save();

    // ✅ Send Notification
    await Notification.create({
      user: userId,
      message: `You have subscribed to ${tool.name} on the ${plan} plan.`,
      type: "success",
      isRead: false,
    });

    res.status(201).json({ message: "Subscribed successfully!", subscription });
  } catch (error) {
    res.status(400).json({ message: "Error subscribing", error });
  }
};

/**
 * ✅ Unsubscribe a user from a SaaS tool
 */
export const unsubscribeFromTool = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { subscriptionId } = req.params;

    const subscription = await Subscription.findOneAndUpdate(
      { _id: subscriptionId, user: userId },
      { status: "canceled", autoRenew: false, cancelDate: new Date() },
      { new: true }
    );

    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    // ✅ Send Notification
    await Notification.create({
      user: userId,
      message: `You have unsubscribed from ${subscription.saasTool}.`,
      type: "warning",
      isRead: false,
    });

    res.json({ message: "Subscription canceled successfully", subscription });
  } catch (error) {
    res.status(500).json({ message: "Error unsubscribing", error });
  }
};
