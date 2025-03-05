import { Request, Response } from "express";
import { Feedback } from "../models/feedback.model";

/** ✅ Submit Feedback */
export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedbackType, targetId, message, rating } = req.body;

    const feedback = new Feedback({
      user: req.user?.userId, // Associate feedback with the logged-in user
      feedbackType, // e.g., "service", "employee", "app"
      targetId, // The ID of the related entity (service, employee, etc.)
      message,
      rating,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error });
  }
};

/** ✅ Get All Feedback */
export const getFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedbackType } = req.query;

    const filter: any = {};
    if (feedbackType) filter.feedbackType = feedbackType;

    const feedbacks = await Feedback.find(filter).populate("user", "name email");
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
};
