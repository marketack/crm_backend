import { Request, Response } from "express";
import { Transaction } from "../models/transaction.model";
import { detectFraud } from "../utils/transaction.utils"; // Fraud detection utility
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}
/** ✅ Create a Transaction */
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user, amount, currency, paymentMethod, status, referenceId, details } = req.body;

    // Fraud detection check
    const fraudRisk = detectFraud(amount, currency, paymentMethod);
    if (fraudRisk) {
      res.status(403).json({ message: "Transaction flagged for review due to potential fraud" });
      return;
    }

    const transaction = new Transaction({
      user: user || req.user?.userId,
      amount,
      currency: currency || "USD",
      paymentMethod,
      status: status || "pending",
      referenceId,
      details,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error creating transaction", error });
  }
};

/** ✅ Get All Transactions with Filters */
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user, status, paymentMethod } = req.query;

    const filter: any = {};
    if (user) filter.user = user;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const transactions = await Transaction.find(filter).populate("user", "name email");
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};

/** ✅ Update a Transaction */
export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    // Ensure only Admins can update transactions
    if (!req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: Only admins can modify transactions" });
      return;
    }

    Object.assign(transaction, req.body);
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction", error });
  }
};

/** ✅ Delete a Transaction */
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    // Only allow Admins to delete transactions
    if (!req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: Only admins can delete transactions" });
      return;
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error });
  }
};
