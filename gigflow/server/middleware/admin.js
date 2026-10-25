const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin")
      return res.status(403).json({ message: "Admin access required" });
    if (!user.isActive)
      return res.status(403).json({ message: "Account deactivated" });
    next();
  } catch (err) {
    next(err);
  }
};
