const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const validate = require("../middleware/validate");
const { createReview, getReviews } = require("../controllers/reviewController");
const {
  createReviewRules,
  mongoIdParam,
} = require("../validators/paymentReviewValidators");

router.post("/", verifyToken, createReviewRules, validate, createReview);
router.get("/:userId", mongoIdParam("userId"), validate, getReviews);

module.exports = router;
