const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const allowed = ["name", "bio", "skills", "avatar"];
  const updates = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (updates.skills && typeof updates.skills === "string")
    updates.skills = updates.skills.split(",").map((s) => s.trim());
  await User.findByIdAndUpdate(req.userId, updates, { new: true });
  res.json({ message: "Profile updated" });
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.userId);
  if (!bcrypt.compareSync(oldPassword, user.password))
    return res.status(400).json({ message: "Old password incorrect" });
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(newPassword, salt);
  await user.save();
  res.json({ message: "Password changed" });
};
