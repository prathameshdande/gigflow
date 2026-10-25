const router = require("express").Router();
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const validate = require("../middleware/validate");
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require("../validators/authValidators");

// Strict limiter on credential-guessing endpoints to slow brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", getMe);
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordRules,
  validate,
  forgotPassword,
);
router.post(
  "/reset-password/:token",
  authLimiter,
  resetPasswordRules,
  validate,
  resetPassword,
);

module.exports = router;
