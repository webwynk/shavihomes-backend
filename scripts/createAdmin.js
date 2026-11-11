require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

/**
 * Script to create a new admin user from command line arguments.
 * Usage: node scripts/createAdmin.js --name="John Doe" --email="john@example.com" --password="password123" --role="admin"
 */

const getArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    args[key] = value;
  });
  return args;
};

const createAdmin = async () => {
  const args = getArgs();
  const { name, email, password, role = "admin" } = args;

  if (!name || !email || !password) {
    console.error("Error: --name, --email, and --password are required.");
    console.log('Usage: npm run create-admin -- --name="Admin" --email="admin@shavi.com" --password="securepassword"');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected...");

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.error(`Error: User with email ${email} already exists!`);
      process.exit(1);
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
    });

    console.log("-----------------------------------------");
    console.log("Admin User Created Successfully!");
    console.log(`Name:     ${newUser.name}`);
    console.log(`Email:    ${newUser.email}`);
    console.log(`Role:     ${newUser.role}`);
    console.log("-----------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
