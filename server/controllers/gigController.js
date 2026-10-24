const Gig = require("../models/Gig");
const Bid = require("../models/Bid");
const Review = require("../models/Review");
const sendNotification = require("../utils/sendNotification");
const { hireBidCore } = require("./bidController");

// ===========================
// Create Gig (clients only, enforced by route middleware)
// ===========================
exports.createGig = async (req, res, next) => {
  try {
    const { title, desc, budget, deadline } = req.body;

    const gig = await Gig.create({
      userId: req.userId,
      title,
      desc,
      budget,
      deadline,
    });

    res.status(201).json(gig);
  } catch (err) {
    next(err);
  }
};

// ===========================
// Get All Gigs (with search + pagination)
// ===========================
exports.getGigs = async (req, res, next) => {
  try {
    const search = (req.query.search || "").trim();
    const paginated = Boolean(req.query.page || req.query.limit);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const filter = search
      ? {
          title: {
            $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          },
        }
      : {};

    let gigsQuery = Gig.find(filter)
      .select("userId title desc budget deadline status createdAt")
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    if (paginated) {
      gigsQuery = gigsQuery.skip((page - 1) * limit).limit(limit);
    }

    const [gigs, total] = await Promise.all([
      gigsQuery,
      paginated
        ? search
          ? Gig.countDocuments(filter)
          : Gig.estimatedDocumentCount()
        : Promise.resolve(0),
    ]);

    // Keep the legacy unpaginated response for older clients. The current
    // marketplace requests pages so large gig collections do not download
    // and render in a single response.
    if (!paginated) {
      return res.json(gigs);
    }

    res.json({ gigs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ===========================
// Get Single Gig
// ===========================
exports.getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate("userId", "name avatar email")
      .populate("assignedTo", "name avatar email");

    if (!gig) return res.status(404).json({ message: "Gig not found" });

    res.json(gig);
  } catch (err) {
    next(err);
  }
};

// ===========================
// Update Gig
// ===========================
exports.updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.userId.toString() !== req.userId)
      return res.status(403).json({ message: "Not your gig" });
    if (gig.status !== "open")
      return res.status(400).json({ message: "Can only edit open gigs" });

    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.desc) updates.desc = req.body.desc;
    if (req.body.budget) updates.budget = req.body.budget;

    const updated = await Gig.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ===========================
// Delete Gig
// ===========================
exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.userId.toString() !== req.userId)
      return res.status(403).json({ message: "Not your gig" });

    await Gig.findByIdAndDelete(req.params.id);
    await Bid.deleteMany({ gigId: req.params.id });

    res.json({ message: "Gig deleted" });
  } catch (err) {
    next(err);
  }
};

// ===========================
// Accept a Bid (gig-centric route: PUT /gigs/:id/accept-bid)
// ===========================
exports.acceptBid = async (req, res, next) => {
  try {
    const gig = await hireBidCore({
      bidId: req.body.bidId,
      requesterId: req.userId,
      expectedGigId: req.params.id,
    });

    res.json({ success: true, message: "Freelancer hired successfully.", gig });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// ===========================
// Submit Work (freelancer)
// ===========================
exports.submitWork = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.assignedTo?.toString() !== req.userId)
      return res.status(403).json({ message: "Not assigned to you" });
    if (gig.status !== "in-progress")
      return res.status(400).json({ message: "Gig cannot accept submission" });

    gig.submission = {
      file: req.body.file || "",
      message: req.body.message,
      submittedAt: new Date(),
    };
    gig.status = "submitted";
    await gig.save();

    await sendNotification({
      userId: gig.userId,
      title: "Work Submitted",
      message: "The freelancer has submitted the completed work.",
      type: "submission",
      gig: gig._id,
    });

    res.json(gig);
  } catch (err) {
    next(err);
  }
};

// ===========================
// Approve Work (client)
// ===========================
exports.approveWork = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.userId.toString() !== req.userId)
      return res.status(403).json({ message: "Not your gig" });
    if (!gig.submission?.submittedAt)
      return res.status(400).json({ message: "No work submitted yet" });
    if (gig.status !== "submitted")
      return res.status(400).json({ message: "Cannot approve at this stage" });

    gig.status = "completed";
    await gig.save();

    await sendNotification({
      userId: gig.assignedTo,
      title: "Project Approved",
      message: "Congratulations! Your project has been approved.",
      type: "approval",
      gig: gig._id,
    });

    res.json({ message: "Work approved", gig });
  } catch (err) {
    next(err);
  }
};

// ===========================
// Leave a review on a completed gig (gig-centric route)
// Reviewer/target are derived from the caller's relation to the gig,
// never taken from the client, to prevent spoofed reviews.
// ===========================
exports.reviewGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.status !== "completed")
      return res
        .status(400)
        .json({ message: "You can only review a completed project." });

    const isOwner = gig.userId.toString() === req.userId;
    const isFreelancer = gig.assignedTo?.toString() === req.userId;

    if (!isOwner && !isFreelancer)
      return res.status(403).json({ message: "You are not part of this project." });

    const targetUser = isOwner ? gig.assignedTo : gig.userId;

    const review = await Review.create({
      gigId: gig._id,
      reviewer: req.userId,
      targetUser,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "You already reviewed this project." });
    }
    next(err);
  }
};
