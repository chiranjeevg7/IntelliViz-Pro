const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getRecommendedCharts,
  getAIInsights,
} = require("../controllers/insightController");
const { protect } = require("../middleware/auth"); // Adjust based on your auth middleware

router.get("/charts", protect, getRecommendedCharts);
router.get("/ai-insights", protect, getAIInsights);

module.exports = router;
