var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import SaaSTool from "../models/saasTool.model";
/**
 * Get all SaaS tools (Public)
 */
export const getSaaSTools = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tools = yield SaaSTool.find();
        res.json(tools);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching SaaS tools", error });
    }
});
/**
 * Get a single SaaS tool (Public)
 */
export const getSaaSToolById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tool = yield SaaSTool.findById(req.params.toolId);
        if (!tool)
            return res.status(404).json({ message: "SaaS tool not found" });
        res.json(tool);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching SaaS tool", error });
    }
});
/**
 * Create a new SaaS tool (Admin Only)
 */
export const createSaaSTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { name, description, price, url } = req.body;
        const tool = new SaaSTool({ name, description, price, url, createdBy: req.user.userId });
        yield tool.save();
        res.status(201).json({ message: "SaaS tool created", tool });
    }
    catch (error) {
        res.status(400).json({ message: "Error creating SaaS tool", error });
    }
});
/**
 * Update a SaaS tool (Admin Only)
 */
export const updateSaaSTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { toolId } = req.params;
        const updatedTool = yield SaaSTool.findByIdAndUpdate(toolId, req.body, { new: true });
        if (!updatedTool)
            return res.status(404).json({ message: "SaaS tool not found" });
        res.json({ message: "SaaS tool updated", updatedTool });
    }
    catch (error) {
        res.status(400).json({ message: "Error updating SaaS tool", error });
    }
});
/**
 * Delete a SaaS tool (Admin Only)
 */
export const deleteSaaSTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { toolId } = req.params;
        const deletedTool = yield SaaSTool.findByIdAndDelete(toolId);
        if (!deletedTool)
            return res.status(404).json({ message: "SaaS tool not found" });
        res.json({ message: "SaaS tool deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting SaaS tool", error });
    }
});
