var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { File } from "../models/file.model";
import multer from "multer";
import path from "path";
import fs from "fs";
// ✅ Configure Multer for File Uploads (Modify for AWS S3/Cloudinary)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
export const upload = multer({ storage }).single("file");
/** ✅ Upload File */
export const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        const file = new File({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
            filename: req.file.filename,
            filePath: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype,
            size: req.file.size,
        });
        yield file.save();
        res.status(201).json(file);
    }
    catch (error) {
        res.status(500).json({ message: "Error uploading file", error });
    }
});
/** ✅ Get All Files */
export const getFiles = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield File.find().populate("user", "name email");
        res.json(files);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching files", error });
    }
});
/** ✅ Delete a File */
export const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const file = yield File.findById(req.params.id);
        if (!file) {
            res.status(404).json({ message: "File not found" });
            return;
        }
        // ✅ Ensure only Admins or Owners can delete files
        if (file.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only delete your own files" });
            return;
        }
        // ✅ Remove File from Storage
        const filePath = path.join(__dirname, "..", file.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        yield file.deleteOne();
        res.json({ message: "File deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting file", error });
    }
});
