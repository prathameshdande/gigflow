/**
 * Creates or resets the platform admin account.
 *
 * Usage:
 *   node seed/seedAdmin.js
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD from .env if present, otherwise falls
 * back to the defaults below. Safe to run repeatedly (upsert), and prints
 * a warning that this is a bootstrap step, not a permanent password.
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

const User = require("../models/User");

const DEFAULT_EMAIL = "admin@gigflow.com";

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set. Add it to server/.env first.");
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL || DEFAULT_EMAIL).toLowerCase();
  // Generate a strong random password if one isn't supplied, rather than
  // shipping a hardcoded default like "admin123".
  const password =
    process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString("base64url");

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hash = await bcrypt.hash(password, 12);

    const admin = await User.findOneAndUpdate(
      { email },
      {
        name: "Admin",
        email,
        password: hash,
        role: "admin",
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    console.log("\n================= ADMIN ACCOUNT READY =================");
    console.log(`  Email    : ${admin.email}`);
    console.log(`  Password : ${password}`);
    console.log(`  User ID  : ${admin._id}`);
    console.log("=========================================================");
    console.log(
      "IMPORTANT: log in and change this password immediately, or set\n" +
        "ADMIN_EMAIL / ADMIN_PASSWORD in your .env before running this\n" +
        "script in a real deployment.\n",
    );

    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err.message);
    process.exit(1);
  }
};

run();
