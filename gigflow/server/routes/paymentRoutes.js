const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const validate = require("../middleware/validate");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyPayments,
  confirmPayment,
} = require("../controllers/paymentController");
const {
  createRazorpayOrderRules,
  verifyRazorpayPaymentRules,
  mongoIdParam,
} = require("../validators/paymentReviewValidators");

router.post(
  "/razorpay/order",
  verifyToken,
  createRazorpayOrderRules,
  validate,
  createRazorpayOrder,
);
router.post(
  "/razorpay/verify",
  verifyToken,
  verifyRazorpayPaymentRules,
  validate,
  verifyRazorpayPayment,
);

router.get("/my", verifyToken, getMyPayments);
router.patch("/:id/confirm", verifyToken, mongoIdParam("id"), validate, confirmPayment);

module.exports = router;
