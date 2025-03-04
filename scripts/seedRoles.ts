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

(async () => {
  try {
    await SaaSTool.insertMany(sampleTools);
    console.log("Sample SaaS tools added!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting SaaS tools:", error);
  }
})();