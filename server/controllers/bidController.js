const Bid = require("../models/Bid");
const Gig = require("../models/Gig");

const createBid = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.body.gigId);
    if (!gig) return res.status(404).send("Gig not found");
    if (gig.status !== "open") return res.status(403).send("Gig is closed!");

    const newBid = new Bid({
      freelancerId: req.userId,
      ...req.body,
    });

    await newBid.save();
    res.status(201).json(newBid);
  } catch (err) {
    next(err);
  }
};

const getBidsByGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (gig.userId !== req.userId)
      return res.status(403).send("Only owner can see bids.");

    const bids = await Bid.find({ gigId: req.params.gigId });
    res.status(200).json(bids);
  } catch (err) {
    next(err);
  }
};

const hireFreelancer = async (req, res, next) => {
  const { bidId } = req.params;
  try {
    const winningBid = await Bid.findById(bidId);
    if (!winningBid) return res.status(404).send("Bid not found.");

    const gig = await Gig.findById(winningBid.gigId);
    if (gig.userId !== req.userId) return res.status(403).send("Not your gig.");

    await Gig.findByIdAndUpdate(gig._id, { status: "assigned" });
    await Bid.findByIdAndUpdate(bidId, { status: "hired" });
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bidId } },
      { status: "rejected" }
    );

    res.status(200).send("Freelancer hired successfully!");
  } catch (err) {
    next(err);
  }
};

const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ freelancerId: req.userId })
      .populate("gigId", "title budget status")
      .sort({ createdAt: -1 });

    res.status(200).json(bids);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/bids/:id
const withdrawBid = async (req, res, next) => {
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


module.exports = {
  createBid,
  getBidsByGig,
  hireFreelancer,
  withdrawBid,
  getMyBids,
};
