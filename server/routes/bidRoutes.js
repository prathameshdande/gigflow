const express = require("express");
const {
  createBid,
  getBidsByGig,
  hireFreelancer,
  getMyBids,
  withdrawBid,
} = require("../controllers/bidController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/", verifyToken, createBid);
router.get("/my", verifyToken, getMyBids);
router.get("/:gigId", verifyToken, getBidsByGig);
router.patch("/hire/:bidId", verifyToken, hireFreelancer);
router.delete("/:id", verifyToken, withdrawBid);

module.exports = router;
