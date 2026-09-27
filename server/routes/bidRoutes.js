const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const restrictTo = require("../middleware/restrictTo");
const validate = require("../middleware/validate");
const {
  createBid,
  getBidsByGig,
  getMyBidForGig,
  hireFreelancer,
  getMyBids,
  withdrawBid,
  updateBid,
} = require("../controllers/bidController");
const {
  createBidRules,
  updateBidRules,
  mongoIdParam,
} = require("../validators/bidValidators");

router.post(
  "/",
  verifyToken,
  restrictTo("freelancer"),
  createBidRules,
  validate,
  createBid,
);
router.get("/my", verifyToken, restrictTo("freelancer"), getMyBids);
router.get(
  "/my/:gigId",
  verifyToken,
  restrictTo("freelancer"),
  mongoIdParam("gigId"),
  validate,
  getMyBidForGig,
);
router.get("/:gigId", verifyToken, mongoIdParam("gigId"), validate, getBidsByGig);
router.patch(
  "/hire/:bidId",
  verifyToken,
  restrictTo("client", "admin"),
  mongoIdParam("bidId"),
  validate,
  hireFreelancer,
);
router.delete("/:id", verifyToken, mongoIdParam("id"), validate, withdrawBid);
router.put("/:id", verifyToken, updateBidRules, validate, updateBid);

module.exports = router;
