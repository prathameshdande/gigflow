const Review = require("../models/Review");
const Gig = require("../models/Gig");

exports.createReview = async (req, res, next) => {
  try {
    const { gigId, targetUser, rating, comment } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.status !== "completed")
      return res
        .status(400)
        .json({ message: "You can only review a completed project." });

    const isOwner = gig.userId.toString() === req.userId;
    const isFreelancer = gig.assignedTo?.toString() === req.userId;
    if (!isOwner && !isFreelancer)
      return res.status(403).json({ message: "You are not part of this project." });

    const expectedTarget = isOwner ? gig.assignedTo?.toString() : gig.userId.toString();
    if (targetUser !== expectedTarget)
      return res.status(400).json({ message: "Invalid target user for this gig." });

    const review = await Review.create({
      gigId,
      reviewer: req.userId,
      targetUser,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You already reviewed this project." });
    }
    next(err);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ targetUser: req.params.userId })
      .populate("reviewer", "name avatar")
      .populate("gigId", "title")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
