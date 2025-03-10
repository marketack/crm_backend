var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Contact } from "../models/contacts.model";
/** ✅ Create a Contact */
export const createContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, // ✅ Ensure createdBy is set
        });
        yield contact.save();
        res.status(201).json(contact);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating contact", error });
    }
});
/** ✅ Update a Contact */
export const updateContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const contact = yield Contact.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ message: "Contact not found" });
            return;
        }
        // Ensure the user owns the contact or is an admin
        if (contact.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only edit your own contacts" });
            return;
        }
        Object.assign(contact, req.body); // Update fields
        yield contact.save();
        res.json(contact);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating contact", error });
    }
});
/** ✅ Delete a Contact */
export const deleteContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const contact = yield Contact.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ message: "Contact not found" });
            return;
        }
        // Only allow the contact owner or an admin to delete
        if (contact.createdBy.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only delete your own contacts" });
            return;
        }
        yield contact.deleteOne();
        res.json({ message: "Contact deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting contact", error });
    }
});
/** ✅ Get All Contacts */
export const getContacts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contacts = yield Contact.find().populate("company", "name email"); // Include company name
        res.json(contacts);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching contacts", error });
    }
});
