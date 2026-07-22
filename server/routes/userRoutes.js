const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);
module.exports = router;
