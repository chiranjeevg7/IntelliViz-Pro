/**
 * Dataset Express Routes
 * Endpoint declarations for /api/v1/datasets
 */

import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadDataset,
  getUserDatasets,
  getDatasetById,
  cleanDataset,
  deleteDataset,
  getDatasetInsights,
} from "../controllers/datasetController.js";
import Dataset from "../models/Dataset.js";
import { analyzeDataset } from "../utils/aiInsightEngine.js";

const router = express.Router();

// All dataset routes require JWT authentication
router.use(protect);

// File Management Routes
router.post("/upload", upload.single("file"), uploadDataset);
router.get("/", getUserDatasets);
router.get("/:id", getDatasetById);
router.post("/:id/clean", cleanDataset);
router.delete("/:id", deleteDataset);
router.get("/:id/insights", protect, getDatasetInsights);

// ==========================================
// AI Insights Route (Rule-Based Analytics Engine)
// ==========================================
router.post("/:id/insights", async (req, res) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dataset) {
      return res
        .status(404)
        .json({ success: false, message: "Dataset not found" });
    }

    // Run rule-based analysis engine on parsed dataset records
    const summary = analyzeDataset(dataset.data || []);

    return res.status(200).json({
      success: true,
      insights: summary,
    });
  } catch (error) {
    console.error("AI Insight Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error processing dataset insights" });
  }
});

export default router;
