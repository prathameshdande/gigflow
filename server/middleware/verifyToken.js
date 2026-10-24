const jwt = require("jsonwebtoken");

/**
 * Verifies the JWT from either the httpOnly cookie (browser flow)
 * or the Authorization: Bearer header (API / mobile flow).
 */
const verifyToken = (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const token = req.cookies?.accessToken || bearer;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  });
};

module.exports = verifyToken;
