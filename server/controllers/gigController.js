const Gig = require('../models/Gig');

const createGig = async (req, res, next) => {
  try {
    const newGig = new Gig({
      userId: req.userId,
      title: req.body.title,
      desc: req.body.desc,
      budget: req.body.budget,
    });

    await newGig.save();
    res.status(201).json(newGig);
  } catch (err) {
    next(err);
  }
};

const getGigs = async (req, res, next) => {
  try {
    const search = req.query.search;
    const filter = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const gigs = await Gig.find(filter).sort({ createdAt: -1 });
    res.status(200).json(gigs);
  } catch (err) {
    next(err);
  }
};

const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).send("Gig not found");
    res.status(200).json(gig);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGig,
  getGigs,
  getGig,
};
