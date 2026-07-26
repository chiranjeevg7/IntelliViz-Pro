/**
 * Authentication Middleware
 * Protects routes by verifying the incoming JWT Bearer Token
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header starting with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token string (e.g., "Bearer <JWT_TOKEN>")
      token = req.headers.authorization.split(" ")[1];

      // Verify token signature against server secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB excluding password field and attach to request object
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User account associated with token no longer exists",
        });
      }

      next();
    } catch (error) {
      console.error(`[Auth Middleware Error]: ${error.message}`);
      return res.status(401).json({
        success: false,
        error: "Not authorized, token validation failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized, no access token provided",
    });
  }
};

module.exports = { protect };
