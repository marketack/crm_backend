import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model"; // Adjust path if needed

// ✅ Load environment variables
dotenv.config();

// ✅ Ensure MONGO_URI is defined
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in the .env file!");
  process.exit(1);
}

// ✅ Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("🔥 Database Connection Error:", error);
    process.exit(1);
  }
}

// ✅ Update User Role Function
async function updateUserRole(userId: string, roleId: string) {
  try {
    await connectDB(); // Ensure connection before updating

    // ✅ Convert userId and roleId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const roleObjectId = new mongoose.Types.ObjectId(roleId);

    const updatedUser = await User.findByIdAndUpdate(
      userObjectId, 
      { role: roleObjectId }, 
      { new: true }
    );

    if (!updatedUser) {
      console.log("❌ User not found!");
      return;
    }

    console.log("✅ User role updated successfully:", updatedUser);
  } catch (error) {
    console.error("🔥 Error updating role:", error);
  } finally {
    mongoose.disconnect(); // Close connection after update
  }
}

// 🚀 Run the Script with Correct ObjectId
updateUserRole("67cc35c2b4a6ae5e1bda9e20", "67c0352c9fdfbcda7ff1ea0b");
