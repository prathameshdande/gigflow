const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      default: "client",
    },
    skills: [String],
    bio: { type: String, maxlength: 2000 },
    avatar: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
