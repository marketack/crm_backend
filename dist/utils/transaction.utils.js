/** ✅ Detect Suspicious Transactions */
export const detectFraud = (amount, currency, paymentMethod) => {
    if (amount > 10000)
        return true; // Flag transactions above $10,000
    if (paymentMethod === "crypto" && amount > 5000)
        return true; // Crypto transactions over $5,000 flagged
    return false;
};
