import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model"; // Ensure the path is correct
import Role from "../models/role.model"; // Ensure the path is correct

dotenv.config(); // Load environment variables

const assignRoleToUser = async () => {
  try {
    // ✅ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    // ✅ Define User ID & Role Name
    const userId = new mongoose.Types.ObjectId("67c025efc56a629fd8f5d535"); // Replace with your actual user ID
    const roleName = "admin"; // Change this if needed

    // ✅ Find User & Role
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found");
      return;
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      console.log("❌ Role not found");
      return;
    }

    // ✅ Check if Role Already Assigned
    if (!user.roles.includes(role._id)) {
      user.roles.push(role._id);
      await user.save();
      console.log(`✅ Role '${roleName}' assigned to user ${userId}`);
    } else {
      console.log(`⚠️ User already has the '${roleName}' role`);
    }

    // ✅ Close Connection
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error assigning role:", error);
    await mongoose.connection.close();
  }
};

// ✅ Run Script
assignRoleToUser();
