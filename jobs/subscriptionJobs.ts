import cron from "node-cron";
import Subscription from "../models/subscription.model";

/**
 * ✅ Runs every 24 hours to check for expired subscriptions
 */
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Running Subscription Expiry Check...");
  const now = new Date();

  await Subscription.updateMany(
    { expiryDate: { $lte: now }, status: "active" },
    { status: "expired" }
  );

  console.log("✅ Expired subscriptions canceled.");
});

/**
 * ✅ Auto-renew active subscriptions every 24 hours
 */
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Running Auto-Renew Subscriptions...");

  const now = new Date();
  const subscriptions = await Subscription.find({
    expiryDate: { $lte: now },
    status: "active",
    autoRenew: true,
  });

  for (const subscription of subscriptions) {
    const newExpiry = new Date();
    newExpiry.setMonth(newExpiry.getMonth() + (subscription.billingCycle === "monthly" ? 1 : 12));

    await Subscription.findByIdAndUpdate(subscription._id, { expiryDate: newExpiry });

    console.log(`✅ Subscription ${subscription._id} renewed.`);
  }

  console.log("✅ Auto-renewal process completed.");
});
