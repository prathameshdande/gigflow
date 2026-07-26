/**
 * Role-based access control. Must run after verifyToken (needs req.userRole).
 * Usage: router.post("/", verifyToken, restrictTo("client", "admin"), createGig)
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.userRole || !roles.includes(req.userRole)) {
    return res.status(403).json({
      message: `Access denied. This action requires one of these roles: ${roles.join(", ")}`,
    });
  }
  next();
};

module.exports = restrictTo;
