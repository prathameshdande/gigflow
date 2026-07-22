const Review = require("../models/Review");

exports.createReview = async (req, res) => {
  try {
    const { gigId, targetUser, rating, comment } = req.body;
    const review = new Review({
      gigId,
      reviewer: req.userId,
      targetUser,
      rating,
      comment,
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ targetUser: req.params.userId })
      .populate("reviewer", "name email")
      .populate("gigId", "title")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
