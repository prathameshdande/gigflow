const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ==========================================================
// Get my profile
// ==========================================================
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// Get another user's public profile (used e.g. to show a
// freelancer's or client's info on a gig)
// ==========================================================
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name bio avatar skills role createdAt",
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// Update my profile
// ==========================================================
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "bio", "skills", "avatar"];
    const updates = {};

    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    if (updates.skills && typeof updates.skills === "string") {
      updates.skills = updates.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated", user });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// Change password
// ==========================================================
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const matches = await bcrypt.compare(oldPassword, user.password);
    if (!matches) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: "Password changed" });
  } catch (err) {
    next(err);
  }
};
