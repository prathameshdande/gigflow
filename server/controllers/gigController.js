const Gig = require("../models/Gig");

exports.createGig = async (req, res, next) => {
  try {
    const gig = new Gig({ userId: req.userId, ...req.body });
    await gig.save();
    res.status(201).json(gig);
  } catch (err) {
    next(err);
  }
};

exports.getGigs = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const gigs = await Gig.find({
      title: { $regex: search, $options: "i" },
    }).sort({ createdAt: -1 });
    res.json(gigs);
  } catch (err) {
    next(err);
  }
};

exports.getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).send("Gig not found");
    res.json(gig);
  } catch (err) {
    next(err);
  }
};

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
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.userId.toString() !== req.userId)
      return res.status(403).json({ message: "Not your gig" });
    await Gig.findByIdAndDelete(req.params.id);
    res.json({ message: "Gig deleted" });
  } catch (err) {
    next(err);
  }
};

// Submit work (freelancer)
exports.submitWork = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.assignedTo?.toString() !== req.userId)
      return res.status(403).json({ message: "Not assigned to you" });
    if (gig.status !== "assigned" && gig.status !== "inProgress")
      return res.status(400).json({ message: "Gig cannot accept submission" });

    gig.submission = {
      files: req.body.files || [],
      message: req.body.message,
      submittedAt: new Date(),
    };
    // Do NOT change status here – client still needs to approve
    await gig.save();
    res.json(gig);
  } catch (err) {
    next(err);
  }
};

// Approve work (client)
exports.approveWork = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.userId.toString() !== req.userId)
      return res.status(403).json({ message: "Not your gig" });
    if (!gig.submission?.submittedAt)
      return res.status(400).json({ message: "No work submitted yet" });
    if (gig.status !== "assigned" && gig.status !== "inProgress")
      return res.status(400).json({ message: "Cannot approve at this stage" });

    // Change status to completed
    gig.status = "completed";
    await gig.save();

    // Optionally create payment here, or do it in the frontend (we already do)
    res.json({ message: "Work approved", gig });
  } catch (err) {
    next(err);
  }
};
