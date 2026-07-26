const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const validate = require("../middleware/validate");
const { sendMessage, getMessages } = require("../controllers/messageController");
const { sendMessageRules, getMessagesRules } = require("../validators/messageValidators");

router.post("/", verifyToken, sendMessageRules, validate, sendMessage);
router.get("/:gigId", verifyToken, getMessagesRules, validate, getMessages);

module.exports = router;
