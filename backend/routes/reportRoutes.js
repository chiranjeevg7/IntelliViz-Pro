/**
 * Report Generator Routes
 * Endpoint declarations for /api/v1/reports
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  generateReport,
  getUserReports,
  exportDatasetCSV,
  downloadReport,
  deleteReport,
} = require("../controllers/reportController");

// Protect all report endpoints
router.use(protect);

// Report CRUD & Generation
router.post("/generate", generateReport);
router.get("/", getUserReports);
router.get("/export/csv/:datasetId", exportDatasetCSV);
router.get("/download/:id", downloadReport);
router.delete("/:id", deleteReport);

module.exports = router;
