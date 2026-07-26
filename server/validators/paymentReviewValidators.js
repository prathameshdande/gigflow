const { body, param } = require("express-validator");

exports.createRazorpayOrderRules = [
  body("gigId").isMongoId().withMessage("Valid gigId is required"),
];

exports.verifyRazorpayPaymentRules = [
  body("gigId").isMongoId().withMessage("Valid gigId is required"),
  body("razorpay_order_id").notEmpty().withMessage("razorpay_order_id is required"),
  body("razorpay_payment_id").notEmpty().withMessage("razorpay_payment_id is required"),
  body("razorpay_signature").notEmpty().withMessage("razorpay_signature is required"),
];

exports.mongoIdParam = (name = "id") => [param(name).isMongoId().withMessage(`Invalid ${name}`)];

exports.createReviewRules = [
  body("gigId").isMongoId().withMessage("Valid gigId is required"),
  body("targetUser").isMongoId().withMessage("Valid targetUser is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
  body("comment").optional().trim().isLength({ max: 2000 }),
];
