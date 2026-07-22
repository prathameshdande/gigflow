const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");
router.post("/", verifyToken, sendMessage);
router.get("/:gigId", verifyToken, getMessages);
module.exports = router;
