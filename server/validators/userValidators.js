const { body } = require("express-validator");

exports.updateProfileRules = [
  body("name").optional().trim().isLength({ min: 1, max: 100 }),
  body("bio").optional().trim().isLength({ max: 2000 }),
  body("avatar").optional({ checkFalsy: true }).trim().isURL().withMessage("Avatar must be a valid URL"),
  body("skills").optional(),
];

exports.changePasswordRules = [
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
];
