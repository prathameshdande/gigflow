const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const restrictTo = require("../middleware/restrictTo");
const validate = require("../middleware/validate");
const {
  createGig,
  getGigs,
  getGig,
  updateGig,
  deleteGig,
  acceptBid,
  submitWork,
  approveWork,
  reviewGig,
} = require("../controllers/gigController");
const {
  createGigRules,
  updateGigRules,
  mongoIdParam,
  submitWorkRules,
  acceptBidRules,
  reviewOnGigRules,
} = require("../validators/gigValidators");

router.get("/", getGigs);
router.get("/:id", mongoIdParam("id"), validate, getGig);

router.post(
  "/",
  verifyToken,
  restrictTo("client", "admin"),
  createGigRules,
  validate,
  createGig,
);

router.put("/:id", verifyToken, updateGigRules, validate, updateGig);
router.delete("/:id", verifyToken, mongoIdParam("id"), validate, deleteGig);

router.put(
  "/:id/accept-bid",
  verifyToken,
  restrictTo("client", "admin"),
  acceptBidRules,
  validate,
  acceptBid,
);

router.put(
  "/:id/submit-work",
  verifyToken,
  restrictTo("freelancer"),
  submitWorkRules,
  validate,
  submitWork,
);

router.put(
  "/:id/approve",
  verifyToken,
  restrictTo("client", "admin"),
  mongoIdParam("id"),
  validate,
  approveWork,
);

router.post(
  "/:id/review",
  verifyToken,
  reviewOnGigRules,
  validate,
  reviewGig,
);

module.exports = router;
