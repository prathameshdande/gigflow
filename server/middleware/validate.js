const { validationResult } = require("express-validator");

/**
 * Runs after an array of express-validator checks; short-circuits
 * with a 422 + field-level error list if any validation failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
