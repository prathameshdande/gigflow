const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const { createReview, getReviews } = require("../controllers/reviewController");
router.post("/", verifyToken, createReview);
router.get("/:userId", getReviews);
module.exports = router;
