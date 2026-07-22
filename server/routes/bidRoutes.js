const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const {
  createBid,
  getBidsByGig,
  hireFreelancer,
  getMyBids,
  withdrawBid,
  updateBid,
} = require("../controllers/bidController");

router.post("/", verifyToken, createBid);
router.get("/my", verifyToken, getMyBids);
router.get("/:gigId", verifyToken, getBidsByGig);
router.patch("/hire/:bidId", verifyToken, hireFreelancer);
router.delete("/:id", verifyToken, withdrawBid);
router.put("/:id", verifyToken, updateBid);
module.exports = router;
