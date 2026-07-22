const User = require("../models/User");
const Gig = require("../models/Gig");
const Bid = require("../models/Bid");
const Message = require("../models/Message");
const Payment = require("../models/Payment");
const Review = require("../models/Review");

// Users
exports.getUsers = async (req, res) => {
  const users = await User.find({ role: { $ne: "admin" } }).select("-password");
  res.json(users);
};
exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isActive = !user.isActive;
  await user.save();
  res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}` });
};
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

// Gigs
exports.getGigs = async (req, res) => {
  const gigs = await Gig.find().populate("userId", "name email");
  res.json(gigs);
};
exports.updateGigStatus = async (req, res) => {
  const { status } = req.body;
  const gig = await Gig.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  res.json(gig);
};
exports.removeGig = async (req, res) => {
  await Gig.findByIdAndDelete(req.params.id);
  res.json({ message: "Gig removed" });
};

// Bids
exports.getAllBids = async (req, res) => {
  const bids = await Bid.find()
    .populate("gigId", "title")
    .populate("freelancerId", "name email");
  res.json(bids);
};
exports.approveBid = async (req, res) => {
  const bid = await Bid.findByIdAndUpdate(
    req.params.bidId,
    { adminApproved: true },
    { new: true },
  );
  if (!bid) return res.status(404).json({ message: "Bid not found" });
  res.json({ message: "Bid approved" });
};
exports.markBidSpam = async (req, res) => {
  const bid = await Bid.findByIdAndUpdate(
    req.params.bidId,
    { status: "spam" },
    { new: true },
  );
  if (!bid) return res.status(404).json({ message: "Bid not found" });
  res.json({ message: "Bid marked as spam" });
};

// Messages
exports.getMessages = async (req, res) => {
  const messages = await Message.find()
    .populate("sender", "name email")
    .populate("receiver", "name email");
  res.json(messages);
};
exports.blockUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.userId, { isActive: false });
  res.json({ message: "User blocked" });
};

// Payments
exports.getPayments = async (req, res) => {
  const payments = await Payment.find()
    .populate("payer", "name")
    .populate("payee", "name")
    .populate("gigId", "title");
  res.json(payments);
};
exports.handleDispute = async (req, res) => {
  const { resolution } = req.body; // "refund" or "complete"
  const payment = await Payment.findById(req.params.paymentId);
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  payment.status = resolution === "refund" ? "refunded" : "completed";
  await payment.save();
  res.json({ message: `Payment ${payment.status}` });
};

// Reviews
exports.getReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate("reviewer", "name")
    .populate("targetUser", "name");
  res.json(reviews);
};
exports.removeReview = async (req, res) => {
  await Review.findByIdAndDelete(req.params.reviewId);
  res.json({ message: "Review removed" });
};

exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "pending") return res.status(400).json({ message: "Payment not pending" });

    payment.status = "completed";
    await payment.save();
    res.json({ message: "Payment confirmed by admin", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};