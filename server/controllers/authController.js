const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendResetEmail = require("../utils/sendEmail");

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already registered" });
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const newUser = new User({
      name,
      email,
      password: hash,
      role: role || "client",
    });
    await newUser.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!bcrypt.compareSync(password, user.password))
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "3d" },
    );
    const { password: _, ...userData } = user._doc;
    res
      .cookie("accessToken", token, cookieOptions)
      .status(200)
      .json({ ...userData, token });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res
    .clearCookie("accessToken", cookieOptions)
    .status(200)
    .json({ message: "Logged out" });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link has been sent." });
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    await sendResetEmail(user.email, resetToken);
    res.status(200).json({ message: "Reset link sent to your email." });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};
