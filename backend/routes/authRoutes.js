/**
 * Auth Express Routes
 * Endpoint declarations for /api/v1/auth
 */

const express = require("express");
const router = express.Router();
const { changePassword } = require("../controllers/authController");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Endpoint: PUT /api/v1/users/change-password
router.put("/change-password", protect, changePassword);

module.exports = router;
