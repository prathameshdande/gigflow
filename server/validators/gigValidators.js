const { body, param } = require("express-validator");

exports.createGigRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 150 }),
  body("desc").trim().notEmpty().withMessage("Description is required").isLength({ max: 5000 }),
  body("budget").isFloat({ gt: 0 }).withMessage("Budget must be a positive number"),
  body("deadline").optional({ nullable: true }).isISO8601().withMessage("Invalid deadline date"),
];

exports.updateGigRules = [
  param("id").isMongoId().withMessage("Invalid gig id"),
  body("title").optional().trim().isLength({ min: 1, max: 150 }),
  body("desc").optional().trim().isLength({ min: 1, max: 5000 }),
  body("budget").optional().isFloat({ gt: 0 }).withMessage("Budget must be a positive number"),
];

exports.mongoIdParam = (name = "id") => [param(name).isMongoId().withMessage(`Invalid ${name}`)];

exports.submitWorkRules = [
  param("id").isMongoId(),
  body("file").optional({ checkFalsy: true }).trim().isURL().withMessage("File must be a valid URL"),
  body("message").trim().notEmpty().withMessage("A completion message is required").isLength({ max: 3000 }),
];

exports.acceptBidRules = [
  param("id").isMongoId(),
  body("bidId").isMongoId().withMessage("A valid bidId is required"),
];

exports.reviewOnGigRules = [
  param("id").isMongoId(),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
  body("comment").optional().trim().isLength({ max: 2000 }),
];
