var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import cron from "node-cron";
import Subscription from "../models/subscription.model";
/**
 * ✅ Runs every 24 hours to check for expired subscriptions
 */
cron.schedule("0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔄 Running Subscription Expiry Check...");
    const now = new Date();
    yield Subscription.updateMany({ expiryDate: { $lte: now }, status: "active" }, { status: "expired" });
    console.log("✅ Expired subscriptions canceled.");
}));
/**
 * ✅ Auto-renew active subscriptions every 24 hours
 */
cron.schedule("0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔄 Running Auto-Renew Subscriptions...");
    const now = new Date();
    const subscriptions = yield Subscription.find({
        expiryDate: { $lte: now },
        status: "active",
        autoRenew: true,
    });
    for (const subscription of subscriptions) {
        const newExpiry = new Date();
        newExpiry.setMonth(newExpiry.getMonth() + (subscription.billingCycle === "monthly" ? 1 : 12));
        yield Subscription.findByIdAndUpdate(subscription._id, { expiryDate: newExpiry });
        console.log(`✅ Subscription ${subscription._id} renewed.`);
    }
    console.log("✅ Auto-renewal process completed.");
}));
