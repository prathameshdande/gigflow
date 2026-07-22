const Bid = require("../models/Bid");
const Gig = require("../models/Gig");

exports.createBid = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.body.gigId);
    if (!gig) return res.status(404).send("Gig not found");
    if (gig.status !== "open") return res.status(403).send("Gig is closed!");
    const newBid = new Bid({ freelancerId: req.userId, ...req.body });
    await newBid.save();
    res.status(201).json(newBid);
  } catch (err) {
    next(err);
  }
};

exports.getBidsByGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (gig.userId.toString() !== req.userId)
      return res.status(403).send("Only owner can see bids.");
    const bids = await Bid.find({ gigId: req.params.gigId });
    res.json(bids);
  } catch (err) {
    next(err);
  }
};

exports.hireFreelancer = async (req, res, next) => {
  try {
    const winningBid = await Bid.findById(req.params.bidId);
    if (!winningBid) return res.status(404).send("Bid not found.");
    const gig = await Gig.findById(winningBid.gigId);
    if (gig.userId.toString() !== req.userId)
      return res.status(403).send("Not your gig.");
    await Gig.findByIdAndUpdate(gig._id, {
      status: "assigned",
      assignedTo: winningBid.freelancerId,
    });
    await Bid.findByIdAndUpdate(req.params.bidId, { status: "hired" });
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: req.params.bidId } },
      { status: "rejected" },
    );
    res.send("Freelancer hired successfully!");
  } catch (err) {
    next(err);
  }
};

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

exports.withdrawBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).send("Bid not found");
    if (bid.freelancerId.toString() !== req.userId)
      return res.status(403).send("Not allowed");
    if (bid.status !== "pending")
      return res.status(400).send("Cannot withdraw this bid");
    await bid.deleteOne();
    res.send("Bid withdrawn");
  } catch (err) {
    next(err);
  }
};

// New: update bid (for freelancer)
exports.updateBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: "Bid not found" });
    if (bid.freelancerId.toString() !== req.userId)
      return res.status(403).json({ message: "Not your bid" });
    if (bid.status !== "pending")
      return res.status(400).json({ message: "Can only update pending bids" });
    if (req.body.price) bid.price = req.body.price;
    if (req.body.message) bid.message = req.body.message;
    await bid.save();
    res.json(bid);
  } catch (err) {
    next(err);
  }
};
