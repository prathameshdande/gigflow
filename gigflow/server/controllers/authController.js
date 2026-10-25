const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendResetEmail = require("../utils/sendEmail");
const { ALLOWED_PUBLIC_ROLES } = require("../validators/authValidators");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days, matches JWT expiry
};

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_KEY, {
    expiresIn: "3d",
  });

// ==========================================================
// Register
// ==========================================================
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // SECURITY: never trust a client-supplied "admin" role. Only client/
    // freelancer may self-register; admins are created via the seed script.
    const safeRole = ALLOWED_PUBLIC_ROLES.includes(role) ? role : "client";

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password: hash,
      role: safeRole,
    });

    // Auto-login after registration for a smoother onboarding flow.
    const token = signToken(newUser);
    const userData = newUser.toObject();
    delete userData.password;

    res
      .cookie("accessToken", token, cookieOptions)
      .status(201)
      .json({ message: "User registered", ...userData, token });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// Login
// ==========================================================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    // Generic message on purpose: don't reveal whether the email exists.
    const invalidCredsMsg = "Invalid email or password";

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: invalidCredsMsg });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "This account has been deactivated. Contact support." });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    const userData = user.toObject();
    delete userData.password;

    res
      .cookie("accessToken", token, cookieOptions)
      .status(200)
      .json({ ...userData, token });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// Logout
// ==========================================================
exports.logout = (req, res) => {
  res
    .clearCookie("accessToken", { ...cookieOptions, maxAge: undefined })
    .status(200)
    .json({ message: "Logged out" });
};

// ==========================================================
// Forgot Password
// ==========================================================
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    // Always respond the same way whether or not the email exists,
    // so this endpoint can't be used to enumerate registered emails.
    const genericResponse = {
      message: "If that email is registered, a reset link has been sent.",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      await sendResetEmail(user.email, resetToken);
    } catch (emailErr) {
      // Don't leak email-provider errors to the client, but don't leave
      // a dangling reset token either.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error("Failed to send reset email:", emailErr.message);
      return res
        .status(500)
        .json({ message: "Could not send reset email. Please try again later." });
    }

    res.status(200).json(genericResponse);
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// Reset Password
// ==========================================================
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

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// Get current authenticated user
// ==========================================================
exports.getMe = async (req, res) => {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = req.cookies?.accessToken || bearer;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated." });
    }

    res.json(user);
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
