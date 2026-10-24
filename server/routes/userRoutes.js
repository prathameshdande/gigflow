const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const validate = require("../middleware/validate");
const {
  getProfile,
  getPublicProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
const {
  updateProfileRules,
  changePasswordRules,
} = require("../validators/userValidators");
const { mongoIdParam } = require("../validators/bidValidators");

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfileRules, validate, updateProfile);
router.put(
  "/change-password",
  verifyToken,
  changePasswordRules,
  validate,
  changePassword,
);
// Public profile (view a client/freelancer from a gig page) - no auth required
router.get("/:id", mongoIdParam("id"), validate, getPublicProfile);

module.exports = router;
