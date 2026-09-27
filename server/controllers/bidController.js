const Bid = require("../models/Bid");
const Gig = require("../models/Gig");
const sendNotification = require("../utils/sendNotification");

// =====================================
// Create Bid
// =====================================
exports.createBid = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.body.gigId);

    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (gig.status !== "open")
      return res.status(400).json({ message: "This gig is closed." });

    if (gig.userId.toString() === req.userId)
      return res
        .status(400)
        .json({ message: "You cannot bid on your own project." });

    const existingBid = await Bid.findOne({
      gigId: gig._id,
      freelancerId: req.userId,
    });

    if (existingBid)
      return res.status(400).json({ message: "You already submitted a bid." });

    const bid = await Bid.create({
      gigId: req.body.gigId,
      freelancerId: req.userId,
      price: req.body.price,
      message: req.body.message,
      status: "pending",
    });

    await sendNotification({
      userId: gig.userId,
      title: "New Bid Received",
      message: "A freelancer submitted a proposal for your project.",
      type: "bid",
      gig: gig._id,
    });

    res.status(201).json(bid);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You already submitted a bid." });
    }
    next(err);
  }
};

// =====================================
// Get Bids of Gig (owner only)
// =====================================
exports.getBidsByGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (gig.userId.toString() !== req.userId)
      return res.status(403).json({ message: "Only owner can view bids." });

    const bids = await Bid.find({ gigId: req.params.gigId }).populate(
      "freelancerId",
      "name",
    ).lean();

    res.json(bids);
  } catch (err) {
    next(err);
  }
};

// Return only the freelancer's bid status for this gig instead of loading
// their complete bid history on every gig detail visit.
exports.getMyBidForGig = async (req, res, next) => {
  try {
    const bid = await Bid.findOne({
      gigId: req.params.gigId,
      freelancerId: req.userId,
    })
      .select("_id")
      .lean();

    res.json({ hasBid: Boolean(bid) });
  } catch (err) {
    next(err);
  }
};

/**
 * Shared "accept a bid" logic used by both:
 *   PATCH /api/bids/hire/:bidId  (freelancer-centric flow)
 *   PUT   /api/gigs/:id/accept-bid  (gig-centric flow)
 * Throws an object { status, message } on failure so callers can
 * respond appropriately without duplicating validation.
 */
exports.hireBidCore = async ({ bidId, requesterId, expectedGigId }) => {
  const winningBid = await Bid.findById(bidId);
  if (!winningBid) throw { status: 404, message: "Bid not found" };

  const gig = await Gig.findById(winningBid.gigId);
  if (!gig) throw { status: 404, message: "Gig not found" };

  if (expectedGigId && gig._id.toString() !== expectedGigId.toString()) {
    throw { status: 400, message: "Bid does not belong to this gig" };
  }

  if (gig.userId.toString() !== requesterId) {
    throw { status: 403, message: "Not your project" };
  }

  if (gig.status !== "open") {
    throw { status: 400, message: "This gig is no longer open for hiring." };
  }

  gig.status = "in-progress";
  gig.assignedTo = winningBid.freelancerId;
  await gig.save();

  winningBid.status = "hired";
  await winningBid.save();

  await Bid.updateMany(
    { gigId: gig._id, _id: { $ne: winningBid._id } },
    { status: "rejected" },
  );

  await sendNotification({
    userId: winningBid.freelancerId,
    title: "Proposal Accepted",
    message: "Congratulations! Your proposal has been accepted.",
    type: "hire",
    gig: gig._id,
  });

  return gig;
};

// =====================================
// Hire Freelancer (bid-centric route)
// =====================================
exports.hireFreelancer = async (req, res, next) => {
  try {
    const gig = await exports.hireBidCore({
      bidId: req.params.bidId,
      requesterId: req.userId,
    });

    res.json({
      success: true,
      message: "Freelancer hired successfully.",
      gig,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// =====================================
// My Bids
// =====================================
exports.getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ freelancerId: req.userId })
      .populate("gigId", "title budget status")
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (err) {
    next(err);
  }
};

// =====================================
// Withdraw Bid
// =====================================
exports.withdrawBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) return res.status(404).json({ message: "Bid not found" });

    if (bid.freelancerId.toString() !== req.userId)
      return res.status(403).json({ message: "Not allowed" });

    if (bid.status !== "pending")
      return res.status(400).json({ message: "Cannot withdraw this bid" });

    await bid.deleteOne();

    res.json({ success: true, message: "Bid withdrawn successfully." });
  } catch (err) {
    next(err);
  }
};

// =====================================
// Update Bid
// =====================================
exports.updateBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) return res.status(404).json({ message: "Bid not found" });

    if (bid.freelancerId.toString() !== req.userId)
      return res.status(403).json({ message: "Not your bid" });

    if (bid.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending bids can be updated." });

    if (req.body.price !== undefined) bid.price = req.body.price;
    if (req.body.message !== undefined) bid.message = req.body.message;

    await bid.save();

    res.json(bid);
  } catch (err) {
    next(err);
  }
};
