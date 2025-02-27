import { Request, Response } from "express";
import Subscription from "../models/subscription.model";
import SaaSTool from "../models/saasTool.model";

export const getUserSubscriptions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const subscriptions = await Subscription.find({ user: userId }).populate("saasTool");
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscriptions", error });
  }
};

export const subscribeToTool = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { toolId } = req.params;
    const toolExists = await SaaSTool.findById(toolId);
    if (!toolExists) return res.status(404).json({ message: "Tool not found" });

    const subscription = new Subscription({ user: userId, saasTool: toolId });
    await subscription.save();

    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ message: "Error subscribing", error });
  }
};

export const unsubscribeFromTool = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    await Subscription.findByIdAndUpdate(subscriptionId, { status: "canceled" });
    res.json({ message: "Subscription canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error unsubscribing", error });
  }
};
