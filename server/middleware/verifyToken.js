const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) return res.status(403).json({ message: "Token invalid" });
    req.userId = payload.id;
    req.userRole = payload.role; // optional
    next();
  });
};

module.exports = verifyToken;
