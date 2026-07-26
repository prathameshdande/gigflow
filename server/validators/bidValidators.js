const { body, param } = require("express-validator");

exports.createBidRules = [
  body("gigId").isMongoId().withMessage("Valid gigId is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
  body("message").trim().notEmpty().withMessage("Proposal message is required").isLength({ max: 3000 }),
];

exports.updateBidRules = [
  param("id").isMongoId(),
  body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
  body("message").optional().trim().isLength({ min: 1, max: 3000 }),
];

exports.mongoIdParam = (name = "id") => [param(name).isMongoId().withMessage(`Invalid ${name}`)];
