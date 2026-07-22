const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const {
  createGig,
  getGigs,
  getGig,
  updateGig,
  deleteGig,
  submitWork,
  approveWork,
} = require("../controllers/gigController");

router.get("/", getGigs);
router.get("/:id", getGig);
router.post("/", verifyToken, createGig);
router.put("/:id", verifyToken, updateGig);
router.delete("/:id", verifyToken, deleteGig);
router.post("/:id/submit", verifyToken, submitWork);
router.patch("/:id/approve", verifyToken, approveWork);
module.exports = router;
