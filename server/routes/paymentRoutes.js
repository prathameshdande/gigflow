const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const {
  createPayment,
  getMyPayments,
  confirmPayment, // ← new
} = require("../controllers/paymentController");

router.post("/", verifyToken, createPayment);
router.get("/my", verifyToken, getMyPayments);
router.patch("/:id/confirm", verifyToken, confirmPayment); // ← new

module.exports = router;
