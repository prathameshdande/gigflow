const User = require("../models/User");
const Gig = require("../models/Gig");
const Bid = require("../models/Bid");
const Message = require("../models/Message");
const Payment = require("../models/Payment");
const Review = require("../models/Review");

// ===================== Users =====================
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(403).json({ message: "Cannot modify an admin account" });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}` });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(403).json({ message: "Cannot delete an admin account" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

// ===================== Gigs =====================
exports.getGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find().populate("userId", "name email").sort({ createdAt: -1 });
    res.json(gigs);
  } catch (err) {
    next(err);
  }
};

exports.updateGigStatus = async (req, res, next) => {
  try {
    const allowedStatuses = ["open", "in-progress", "submitted", "completed", "closed"];
    const { status } = req.body;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const gig = await Gig.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    res.json(gig);
  } catch (err) {
    next(err);
  }
};

exports.removeGig = async (req, res, next) => {
  try {
    const gig = await Gig.findByIdAndDelete(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    await Bid.deleteMany({ gigId: req.params.id });
    res.json({ message: "Gig removed" });
  } catch (err) {
    next(err);
  }
};

// ===================== Bids =====================
exports.getAllBids = async (req, res, next) => {
  try {
    const bids = await Bid.find()
      .populate("gigId", "title")
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    next(err);
  }
};

exports.approveBid = async (req, res, next) => {
  try {
    const bid = await Bid.findByIdAndUpdate(
      req.params.bidId,
      { adminApproved: true },
      { new: true },
    );
    if (!bid) return res.status(404).json({ message: "Bid not found" });
    res.json({ message: "Bid approved" });
  } catch (err) {
    next(err);
  }
};

exports.markBidSpam = async (req, res, next) => {
  try {
    const bid = await Bid.findByIdAndUpdate(
      req.params.bidId,
      { status: "spam" },
      { new: true },
    );
    if (!bid) return res.status(404).json({ message: "Bid not found" });
    res.json({ message: "Bid marked as spam" });
  } catch (err) {
    next(err);
  }
};

// ===================== Messages =====================
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find()
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(403).json({ message: "Cannot block an admin account" });

    user.isActive = false;
    await user.save();
    res.json({ message: "User blocked" });
  } catch (err) {
    next(err);
  }
};

// ===================== Payments =====================
exports.getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate("payer", "name")
      .populate("payee", "name")
      .populate("gigId", "title")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

exports.handleDispute = async (req, res, next) => {
  try {
    const { resolution } = req.body; // "refund" or "complete"
    if (!["refund", "complete"].includes(resolution)) {
      return res.status(400).json({ message: "resolution must be 'refund' or 'complete'" });
    }

    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = resolution === "refund" ? "refunded" : "completed";
    await payment.save();
    res.json({ message: `Payment ${payment.status}` });
  } catch (err) {
    next(err);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "pending")
      return res.status(400).json({ message: "Payment not pending" });

    payment.status = "completed";
    await payment.save();
    res.json({ message: "Payment confirmed by admin", payment });
  } catch (err) {
    next(err);
  }
};

// ===================== Reviews =====================
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("reviewer", "name")
      .populate("targetUser", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

exports.removeReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review removed" });
  } catch (err) {
    next(err);
  }
};

// ===================== Dashboard stats =====================
exports.getStats = async (req, res, next) => {
  try {
    const [users, gigs, openGigs, bids, paymentStats, reviews] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      Gig.countDocuments(),
      Gig.countDocuments({ status: "open" }),
      Bid.countDocuments(),
      Payment.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "completed"] },
                  { $ifNull: ["$platformFee", 0] },
                  0,
                ],
              },
            },
          },
        },
      ]),
      Review.countDocuments(),
    ]);

    const { count: paymentCount = 0, revenue = 0 } = paymentStats[0] || {};

    res.json({
      users,
      gigs,
      openGigs,
      bids,
      payments: paymentCount,
      revenue,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};
