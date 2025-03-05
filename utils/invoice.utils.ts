import { Invoice } from "../models/invoice.model";

/** ✅ Generate Unique Invoice Number */
export const generateInvoiceNumber = async (): Promise<string> => {
  const count = await Invoice.countDocuments();
  const uniqueId = count + 1;
  return `INV-${new Date().getFullYear()}-${uniqueId.toString().padStart(6, "0")}`;
};

/** ✅ Calculate Invoice Totals */
export const calculateInvoiceTotals = (
  items: { quantity: number; price: number }[],
  taxes?: { rate: number }[],
  discount?: { type: "percentage" | "fixed"; value: number }
) => {
  let subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  let taxAmount = taxes ? taxes.reduce((sum, tax) => sum + (subtotal * tax.rate) / 100, 0) : 0;

  let discountAmount = 0;
  if (discount) {
    discountAmount = discount.type === "percentage" ? (subtotal * discount.value) / 100 : discount.value;
  }

  const totalAmount = subtotal + taxAmount - discountAmount;
  return { subtotal, totalAmount, balanceDue: totalAmount };
};
