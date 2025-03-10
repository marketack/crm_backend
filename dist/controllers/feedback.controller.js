var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Feedback } from "../models/feedback.model";
/** ✅ Submit Feedback */
export const submitFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { feedbackType, targetId, message, rating } = req.body;
        const feedback = new Feedback({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, // Associate feedback with the logged-in user
            feedbackType, // e.g., "service", "employee", "app"
            targetId, // The ID of the related entity (service, employee, etc.)
            message,
            rating,
        });
        yield feedback.save();
        res.status(201).json(feedback);
    }
    catch (error) {
        res.status(500).json({ message: "Error submitting feedback", error });
    }
});
/** ✅ Get All Feedback */
export const getFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { feedbackType } = req.query;
        const filter = {};
        if (feedbackType)
            filter.feedbackType = feedbackType;
        const feedbacks = yield Feedback.find(filter).populate("user", "name email");
        res.json(feedbacks);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching feedback", error });
    }
});
