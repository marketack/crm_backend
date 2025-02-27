import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import mongoose, { FilterQuery } from "mongoose";
import CMS, { ICMS } from "../models/cms.model";

/**
 * 📥 Get All CMS Entries (With Status Filter)
 */
export const getAllCMS = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const status = req.query.status as "published" | "draft" | "archived";

  const filter: FilterQuery<ICMS> = { isDeleted: false };
  if (status) filter.status = status;

  const cmsEntries = await CMS.find(filter).sort({ createdAt: -1 }).lean();
  res.json(cmsEntries);
});

/**
 * 📥 Get a Single CMS Entry by ID
 */
export const getCMSById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid CMS ID format" });
    return;
  }

  const cmsEntry = await CMS.findOne({ _id: id, isDeleted: false }).lean();
  if (!cmsEntry) {
    res.status(404).json({ message: "CMS entry not found" });
    return;
  }

  res.json(cmsEntry);
});

/**
 * 🚀 Create a CMS Entry
 */
export const createCMS = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, content, status } = req.body;
  const createdBy = new mongoose.Types.ObjectId(req.user?.userId);

  if (!title || !content) {
    res.status(400).json({ message: "Title and content are required" });
    return;
  }

  const newCMS = new CMS({ title, content, status, createdBy });
  await newCMS.save();

  res.status(201).json(newCMS);
});

/**
 * 📝 Update CMS Entry
 */
export const updateCMS = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid CMS ID format" });
    return;
  }

  const cmsEntry = await CMS.findOne({ _id: id, isDeleted: false });
  if (!cmsEntry) {
    res.status(404).json({ message: "CMS entry not found" });
    return;
  }

  Object.assign(cmsEntry, req.body);
  await cmsEntry.save();

  res.json(cmsEntry);
});

/**
 * 🗑️ Soft Delete CMS Entry
 */
export const deleteCMS = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid CMS ID format" });
    return;
  }

  const cmsEntry = await CMS.findOne({ _id: id, isDeleted: false });
  if (!cmsEntry) {
    res.status(404).json({ message: "CMS entry not found" });
    return;
  }

  cmsEntry.isDeleted = true;
  await cmsEntry.save();

  res.json({ message: "CMS entry soft deleted successfully" });
});
