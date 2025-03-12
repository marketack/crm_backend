import { Request, Response } from "express";
import { Customer } from "../models/customer.model";
import { ActivityLog } from "../models/activityLog.model";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

/** ✅ Get All Customers */
export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json({ message: "Customers retrieved successfully", customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers", error: error.message });
  }
};

/** ✅ Update Customer */
export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400).json({ message: "Invalid customer ID" });
      return;
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    Object.assign(customer, req.body);
    await customer.save();

    // Log the update
    await ActivityLog.create({
      user: req.user?.userId,
      action: "Updated Customer",
      targetType: "customer",
      targetId: customer._id,
    });

    res.json({ message: "Customer updated successfully", customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Error updating customer", error: error.message });
  }
};

/** ✅ Delete Customer */
export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      res.status(400).json({ message: "Invalid customer ID" });
      return;
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    await customer.deleteOne();

    // Log the deletion
    await ActivityLog.create({
      user: req.user?.userId,
      action: "Deleted Customer",
      targetType: "customer",
      targetId: customer._id,
    });

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Error deleting customer", error: error.message });
  }
};
