const express = require("express");
const router = express.Router();

const {
  createGig,
  getGigs,
  getGig
} = require("../controllers/gigController");

const verifyToken = require("../middleware/verifyToken");

router.get("/", getGigs);

router.get("/:id", getGig);

router.post("/", verifyToken, createGig);

module.exports = router;
