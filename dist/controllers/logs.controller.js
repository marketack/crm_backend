var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from "../models/logs.model";
/** ✅ Get System Logs with Filtering */
export const getLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, action, startDate, endDate } = req.query;
        const filter = {};
        if (user)
            filter.user = user;
        if (action)
            filter.action = action;
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate)
                filter.timestamp.$gte = new Date(startDate);
            if (endDate)
                filter.timestamp.$lte = new Date(endDate);
        }
        const logs = yield Log.find(filter).populate("user", "name email");
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving logs", error });
    }
});
/** ✅ Clear System Logs (Admin-Only) */
export const clearLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Ensure only admins can clear logs
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: Only admins can clear logs" });
            return;
        }
        yield Log.deleteMany({});
        res.json({ message: "All logs have been cleared successfully." });
    }
    catch (error) {
        res.status(500).json({ message: "Error clearing logs", error });
    }
});
