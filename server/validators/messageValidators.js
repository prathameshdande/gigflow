const { body, param } = require("express-validator");

exports.sendMessageRules = [
  body("gigId").isMongoId().withMessage("Valid gigId is required"),
  body("receiver").isMongoId().withMessage("Valid receiver id is required"),
  body("content").trim().notEmpty().withMessage("Message content is required").isLength({ max: 5000 }),
  body("fileUrl").optional({ checkFalsy: true }).trim().isURL().withMessage("fileUrl must be a valid URL"),
];

exports.getMessagesRules = [param("gigId").isMongoId().withMessage("Invalid gig id")];
