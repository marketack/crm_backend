import { Request, Response } from "express";
import { Invoice } from "../models/invoice.model";
import { generateInvoiceNumber, calculateInvoiceTotals } from "../utils/invoice.utils"; // Utility functions

/** ✅ Create an Invoice */
export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer, items, taxes, discount, dueDate, currency } = req.body;

    // ✅ Auto-generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // ✅ Calculate total amounts
    const { subtotal, totalAmount, balanceDue } = calculateInvoiceTotals(items, taxes, discount);

    const invoice = new Invoice({
      invoiceNumber,
      customer,
      items,
      taxes,
      discount,
      subtotal,
      totalAmount,
      balanceDue,
      dueDate,
      currency: currency || "USD",
      status: "pending",
      createdBy: req.user?.userId,
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Error creating invoice", error });
  }
};

/** ✅ Get All Invoices with Filters */
export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, customer, currency } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (currency) filter.currency = currency;

    const invoices = await Invoice.find(filter)
      .populate("customer", "name email phone")
      .populate("createdBy", "name email");

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoices", error });
  }
};

/** ✅ Update an Invoice */
export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    // Ensure only Admins or the Invoice Creator can update
    if (invoice.createdBy.toString() !== req.user?.userId && !req.user?.roles.includes("admin") && !req.user?.roles.includes("accounting")) {
      res.status(403).json({ message: "Unauthorized: You can only update your own invoices" });
      return;
    }

    // Update and recalculate totals
    Object.assign(invoice, req.body);
    const { subtotal, totalAmount, balanceDue } = calculateInvoiceTotals(invoice.items, invoice.taxes, invoice.discount);
    invoice.subtotal = subtotal;
    invoice.totalAmount = totalAmount;
    invoice.balanceDue = balanceDue;

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Error updating invoice", error });
  }
};

/** ✅ Record a Payment for an Invoice */
export const recordPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    const { amount, method, transactionId } = req.body;
    if (amount <= 0) {
      res.status(400).json({ message: "Invalid payment amount" });
      return;
    }

    // ✅ Add payment to invoice
    invoice.payments.push({ date: new Date(), amount, method, transactionId });
    invoice.amountPaid += amount;
    invoice.balanceDue = invoice.totalAmount - invoice.amountPaid;

    // ✅ Auto-update status
    if (invoice.balanceDue === 0) invoice.status = "paid";
    else invoice.status = "partially_paid";

    await invoice.save();
    res.json({ message: "Payment recorded successfully", invoice });
  } catch (error) {
    res.status(500).json({ message: "Error recording payment", error });
  }
};

/** ✅ Delete an Invoice */
export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    // Only allow the invoice creator or an admin to delete
    if (invoice.createdBy.toString() !== req.user?.userId && !req.user?.roles.includes("admin") && !req.user?.roles.includes("accounting")) {
      res.status(403).json({ message: "Unauthorized: You can only delete your own invoices" });
      return;
    }

    await invoice.deleteOne();
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting invoice", error });
  }
};
