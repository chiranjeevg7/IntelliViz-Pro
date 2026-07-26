/**
 * JWT Token Generator Helper
 * Signs a JWT token containing the user's ID
 */

const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

module.exports = generateToken;
