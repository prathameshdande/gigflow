const router = require("express").Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
module.exports = router;
