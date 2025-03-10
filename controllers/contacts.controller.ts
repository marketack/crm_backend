import { Request, Response } from "express";
import { Contact } from "../models/contacts.model";
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}
/** ✅ Create a Contact */
export const createContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, company, position, notes, type, status, source, assignedTo } = req.body;

    const contact = new Contact({
      name,
      email,
      phone,
      company,
      position,
      notes,
      type,
      status,
      source,
      assignedTo,
      createdBy: req.user?.userId, // ✅ Ensure createdBy is set
    });

    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: "Error creating contact", error });
  }
};

/** ✅ Update a Contact */
export const updateContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }

    // Ensure the user owns the contact or is an admin
    if (contact.createdBy.toString() !== req.user?.userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: You can only edit your own contacts" });
      return;
    }

    Object.assign(contact, req.body); // Update fields
    await contact.save();

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: "Error updating contact", error });
  }
};

/** ✅ Delete a Contact */
export const deleteContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }

    // Only allow the contact owner or an admin to delete
    if (contact.createdBy.toString() !== req.user?.userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: You can only delete your own contacts" });
      return;
    }

    await contact.deleteOne();
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting contact", error });
  }
};

/** ✅ Get All Contacts */
export const getContacts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await Contact.find().populate("company", "name email"); // Include company name
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contacts", error });
  }
};
