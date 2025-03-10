var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import SaaSTool from "../models/saasTool.model";
const sampleTools = [
    {
        name: "Cloud CRM",
        description: "A powerful CRM for managing customer interactions.",
        price: 29.99,
        url: "https://cloudcrm.com",
        createdBy: new mongoose.Types.ObjectId("67c025efc56a629fd8f5d535"),
    },
    {
        name: "AI Marketing Tool",
        description: "AI-powered marketing automation platform.",
        price: 49.99,
        url: "https://aimarketing.com",
        createdBy: new mongoose.Types.ObjectId("67c025efc56a629fd8f5d535"),
    },
    {
        name: "Project Management",
        description: "Collaboration and project tracking tool.",
        price: 19.99,
        url: "https://pmtool.com",
        createdBy: new mongoose.Types.ObjectId("67c025efc56a629fd8f5d535"),
    },
];
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield SaaSTool.insertMany(sampleTools);
        console.log("Sample SaaS tools added!");
        mongoose.connection.close();
    }
    catch (error) {
        console.error("Error inserting SaaS tools:", error);
    }
}))();
