const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const admin = require("../middleware/admin");
const {
  getUsers,
  toggleUserStatus,
  deleteUser,
  getGigs,
  updateGigStatus,
  removeGig,
  getAllBids,
  approveBid,
  markBidSpam,
  getMessages,
  blockUser,
  getPayments,
  handleDispute,
  confirmPayment, // ← added
  getReviews,
  removeReview,
} = require("../controllers/adminController");

router.use(verifyToken, admin);

// Users
router.get("/users", getUsers);
router.patch("/users/:id/toggle", toggleUserStatus);
router.delete("/users/:id", deleteUser);

// Gigs
router.get("/gigs", getGigs);
router.patch("/gigs/:id/status", updateGigStatus);
router.delete("/gigs/:id", removeGig);

// Bids
router.get("/bids", getAllBids);
router.patch("/bids/:bidId/approve", approveBid);
router.patch("/bids/:bidId/spam", markBidSpam);

// Messages
router.get("/messages", getMessages);
router.patch("/block/:userId", blockUser);

// Payments
router.get("/payments", getPayments);
router.post("/dispute/:paymentId", handleDispute);
router.patch("/payments/:paymentId/confirm", confirmPayment); // ← new

// Reviews
router.get("/reviews", getReviews);
router.delete("/reviews/:reviewId", removeReview);

module.exports = router;
