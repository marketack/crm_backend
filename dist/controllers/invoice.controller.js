var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Invoice } from "../models/invoice.model";
import { generateInvoiceNumber, calculateInvoiceTotals } from "../utils/invoice.utils"; // Utility functions
/** ✅ Create an Invoice */
export const createInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { customer, items, taxes, discount, dueDate, currency } = req.body;
        // ✅ Auto-generate invoice number
        const invoiceNumber = yield generateInvoiceNumber();
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
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        });
        yield invoice.save();
        res.status(201).json(invoice);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating invoice", error });
    }
});
/** ✅ Get All Invoices with Filters */
export const getInvoices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, customer, currency } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (customer)
            filter.customer = customer;
        if (currency)
            filter.currency = currency;
        const invoices = yield Invoice.find(filter)
            .populate("customer", "name email phone")
            .populate("createdBy", "name email");
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching invoices", error });
    }
});
/** ✅ Update an Invoice */
export const updateInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const invoice = yield Invoice.findById(req.params.id);
        if (!invoice) {
            res.status(404).json({ message: "Invoice not found" });
            return;
        }
        // Ensure only Admins or the Invoice Creator can update
        if (invoice.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin")) && !((_c = req.user) === null || _c === void 0 ? void 0 : _c.roles.includes("accounting"))) {
            res.status(403).json({ message: "Unauthorized: You can only update your own invoices" });
            return;
        }
        // Update and recalculate totals
        Object.assign(invoice, req.body);
        const { subtotal, totalAmount, balanceDue } = calculateInvoiceTotals(invoice.items, invoice.taxes, invoice.discount);
        invoice.subtotal = subtotal;
        invoice.totalAmount = totalAmount;
        invoice.balanceDue = balanceDue;
        yield invoice.save();
        res.json(invoice);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating invoice", error });
    }
});
/** ✅ Record a Payment for an Invoice */
export const recordPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoice = yield Invoice.findById(req.params.id);
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
        if (invoice.balanceDue === 0)
            invoice.status = "paid";
        else
            invoice.status = "partially_paid";
        yield invoice.save();
        res.json({ message: "Payment recorded successfully", invoice });
    }
    catch (error) {
        res.status(500).json({ message: "Error recording payment", error });
    }
});
/** ✅ Delete an Invoice */
export const deleteInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const invoice = yield Invoice.findById(req.params.id);
        if (!invoice) {
            res.status(404).json({ message: "Invoice not found" });
            return;
        }
        // Only allow the invoice creator or an admin to delete
        if (invoice.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin")) && !((_c = req.user) === null || _c === void 0 ? void 0 : _c.roles.includes("accounting"))) {
            res.status(403).json({ message: "Unauthorized: You can only delete your own invoices" });
            return;
        }
        yield invoice.deleteOne();
        res.json({ message: "Invoice deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting invoice", error });
    }
});
