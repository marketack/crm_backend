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
/** ✅ Generate Unique Invoice Number */
export const generateInvoiceNumber = () => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield Invoice.countDocuments();
    const uniqueId = count + 1;
    return `INV-${new Date().getFullYear()}-${uniqueId.toString().padStart(6, "0")}`;
});
/** ✅ Calculate Invoice Totals */
export const calculateInvoiceTotals = (items, taxes, discount) => {
    let subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    let taxAmount = taxes ? taxes.reduce((sum, tax) => sum + (subtotal * tax.rate) / 100, 0) : 0;
    let discountAmount = 0;
    if (discount) {
        discountAmount = discount.type === "percentage" ? (subtotal * discount.value) / 100 : discount.value;
    }
    const totalAmount = subtotal + taxAmount - discountAmount;
    return { subtotal, totalAmount, balanceDue: totalAmount };
};
