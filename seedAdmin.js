require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/shavi-homes");
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@gmail.com" });
    if (adminExists) {
      await User.deleteOne({ email: "admin@gmail.com" });
      console.log("Existing admin removed. Re-creating with new credentials...");
    }

    const admin = await User.create({
      name: "Super Admin",
      email: "admin@gmail.com",
      password: "Admin@123",
      role: "super-admin",
    });

    console.log("Admin user created successfully!");
    console.log("Email: admin@gmail.com");
    console.log("Password: Admin@123");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedAdmin();
