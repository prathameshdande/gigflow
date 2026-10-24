const { body, param } = require("express-validator");

const ALLOWED_PUBLIC_ROLES = ["client", "freelancer"];

// NOTE: we deliberately do NOT use express-validator's .normalizeEmail()
// here. It performs provider-specific canonicalization (e.g. stripping
// dots and "+tags" from Gmail addresses), which silently rewrites the
// value a user typed. That's fine for deduplication use cases, but wrong
// for login matching: it can compute a different string than what's
// actually stored (from before this normalization existed, or from a
// provider it treats differently), causing valid logins to fail with a
// misleading "invalid credentials" error. A plain trim + lowercase is
// sufficient and matches what's stored on the User model.
const emailField = (name = "email") =>
  body(name)
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .customSanitizer((value) => value.toLowerCase());

exports.registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  emailField("email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  // Role is optional; anything other than client/freelancer is rejected in the
  // controller regardless (defense in depth against admin self-assignment).
  body("role")
    .optional()
    .isIn(ALLOWED_PUBLIC_ROLES)
    .withMessage("Role must be either client or freelancer"),
];

exports.loginRules = [
  emailField("email"),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.forgotPasswordRules = [emailField("email")];

exports.resetPasswordRules = [
  param("token").notEmpty(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

exports.ALLOWED_PUBLIC_ROLES = ALLOWED_PUBLIC_ROLES;
