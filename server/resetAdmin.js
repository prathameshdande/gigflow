// server/resetAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hash = bcrypt.hashSync("admin123", 10);

    // Upsert: update if exists, insert if not
    await User.findOneAndUpdate(
      { email: "admin@GigFlow.com" },
      {
        name: "Admin",
        email: "admin@GigFlow.com",
        password: hash,
        role: "admin",
        isActive: true,
      },
      { upsert: true, new: true },
    );

    console.log("Admin user ready: admin@GigFlow.com / admin123");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetAdmin();
