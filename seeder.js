const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Role = require("./models/Role");

const seedDatabase = async () => {
  try {
    await mongoose.connect("mongodb+srv://crm:crm12345@crm.orhih.mongodb.net/?retryWrites=true&w=majority&appName=crm", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB.");

    // Ensure roles exist
    let adminRole = await Role.findOne({ name: "admin" });
    if (!adminRole) {
      adminRole = new Role({ name: "admin" });
      await adminRole.save();
      console.log("✅ Admin role created.");
    }

    let userRole = await Role.findOne({ name: "user" });
    if (!userRole) {
      userRole = new Role({ name: "user" });
      await userRole.save();
      console.log("✅ User role created.");
    }

    // Check if the admin user already exists
    const existingAdmin = await User.findOne({ email: "anasalsayed3@icloud.com" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Applelove1@", 10);
      const newAdmin = new User({
        firstName: "Anas",
        lastName: "Alseid",
        username: "anasalseid",
        email: "anasalsayed3@icloud.com",
        phoneNumber: "0777104191",
        password: "$2b$12$jSHKFizAkhNMmwiplf7UA.ijbyKtqlxm1Od9c9jpSD6E5kaj7nTda", // Manually hashed password
        role: adminRole._id,
        permissions: [],
        isEmailVerified: true,
        status: "active",
      });
      

      await newAdmin.save();
      console.log("✅ Admin user created: anasalsayed3@icloud.com");
    } else {
      console.log("⚠️ Admin user already exists.");
    }

    console.log("🎉 Database seeding complete.");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    mongoose.connection.close();
  }
};

seedDatabase();
