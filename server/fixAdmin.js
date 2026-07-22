// server/fixAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Remove old admin if any
    await User.deleteOne({ email: "admin@gigflow.com" });

    // Create new admin with fresh hash
    const hash = bcrypt.hashSync("admin123", 10);
    const admin = await User.create({
      name: "Admin",
      email: "admin@gigflow.com",
      password: hash,
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully:");
    console.log(`  email   : ${admin.email}`);
    console.log(`  password: admin123`);
    console.log(`  user ID : ${admin._id}`);

    // Verify immediately
    const check = await User.findOne({ email: "admin@gigflow.com" });
    console.log("Verification:", check ? "Found" : "NOT FOUND");

    process.exit();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

fixAdmin();
