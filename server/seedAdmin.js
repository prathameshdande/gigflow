const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ email: "admin@GigFlow.com" });
    if (adminExists) {
      console.log("Admin user already exists");
      return process.exit();
    }

    const hash = bcrypt.hashSync("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@gigflow.com",
      password: hash,
      role: "admin",
      isActive: true,
    });

    console.log("Admin user created: admin@gigflow.com / admin123");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
