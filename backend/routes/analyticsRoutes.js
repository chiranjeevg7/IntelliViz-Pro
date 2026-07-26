/**
 * Analytics & Saved Charts Routes
 * Endpoint declarations for /api/v1/analytics and /api/v1/charts
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getDatasetInsights, saveChart, getUserSavedCharts, deleteSavedChart } =
  { ...require("../controllers/analyticsController") };

// All analytics and chart routes require authentication
router.use(protect);

// Rule-Based AI Insights endpoint
router.get("/insights/:datasetId", getDatasetInsights);

// Saved Chart Configurations endpoints
router.post("/charts", saveChart);
router.get("/charts", getUserSavedCharts);
router.delete("/charts/:id", deleteSavedChart);

module.exports = router;
