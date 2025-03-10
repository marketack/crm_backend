var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Transaction } from "../models/transaction.model";
import { detectFraud } from "../utils/transaction.utils"; // Fraud detection utility
/** ✅ Create a Transaction */
export const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { user, amount, currency, paymentMethod, status, referenceId, details } = req.body;
        // Fraud detection check
        const fraudRisk = detectFraud(amount, currency, paymentMethod);
        if (fraudRisk) {
            res.status(403).json({ message: "Transaction flagged for review due to potential fraud" });
            return;
        }
        const transaction = new Transaction({
            user: user || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
            amount,
            currency: currency || "USD",
            paymentMethod,
            status: status || "pending",
            referenceId,
            details,
        });
        yield transaction.save();
        res.status(201).json(transaction);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating transaction", error });
    }
});
/** ✅ Get All Transactions with Filters */
export const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, status, paymentMethod } = req.query;
        const filter = {};
        if (user)
            filter.user = user;
        if (status)
            filter.status = status;
        if (paymentMethod)
            filter.paymentMethod = paymentMethod;
        const transactions = yield Transaction.find(filter).populate("user", "name email");
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching transactions", error });
    }
});
/** ✅ Update a Transaction */
export const updateTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const transaction = yield Transaction.findById(req.params.id);
        if (!transaction) {
            res.status(404).json({ message: "Transaction not found" });
            return;
        }
        // Ensure only Admins can update transactions
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: Only admins can modify transactions" });
            return;
        }
        Object.assign(transaction, req.body);
        yield transaction.save();
        res.json(transaction);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating transaction", error });
    }
});
/** ✅ Delete a Transaction */
export const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const transaction = yield Transaction.findById(req.params.id);
        if (!transaction) {
            res.status(404).json({ message: "Transaction not found" });
            return;
        }
        // Only allow Admins to delete transactions
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: Only admins can delete transactions" });
            return;
        }
        yield transaction.deleteOne();
        res.json({ message: "Transaction deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting transaction", error });
    }
});
