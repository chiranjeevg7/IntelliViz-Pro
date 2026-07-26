/**
 * Analytics Controller
 * Handles Rule-Based AI Insights generation and Saved Chart configurations CRUD operations
 */

const fs = require("fs");
const path = require("path");
const Dataset = require("../models/Dataset");
const SavedChart = require("../models/SavedChart");
const { parseCSV, parseExcel } = require("../utils/dataParser");
const { generateRuleBasedInsights } = require("../utils/insightsEngine");

const readDatasetRows = (filePath, fileType) => {
  const ext = (fileType || path.extname(filePath))
    .toLowerCase()
    .replace(".", "");
  if (["xls", "xlsx"].includes(ext)) {
    return parseExcel(filePath);
  }
  return parseCSV(filePath);
};

/**
 * @desc    Generate Rule-Based AI Insights for a dataset
 * @route   GET /api/v1/analytics/insights/:datasetId
 * @access  Private
 */
const getDatasetInsights = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.datasetId,
      user: req.user._id,
    });

    if (!dataset) {
      return res
        .status(404)
        .json({ success: false, error: "Dataset not found" });
    }

    if (!fs.existsSync(dataset.filePath)) {
      return res
        .status(400)
        .json({ success: false, error: "Dataset file missing on server" });
    }

    const rows = readDatasetRows(dataset.filePath, dataset.fileType);
    const insightsResult = generateRuleBasedInsights(rows, dataset.columns);

    // Persist quality score on dataset model
    dataset.qualityScore = insightsResult.metrics.qualityScore;
    await dataset.save();

    res.status(200).json({
      success: true,
      data: {
        datasetId: dataset._id,
        datasetName: dataset.originalName,
        ...insightsResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save a new chart visualization configuration
 * @route   POST /api/v1/charts
 * @access  Private
 */
const saveChart = async (req, res, next) => {
  try {
    const { datasetId, title, chartType, config } = req.body;

    if (!datasetId || !chartType) {
      return res.status(400).json({
        success: false,
        error: "Please provide datasetId and chartType",
      });
    }

    const dataset = await Dataset.findOne({
      _id: datasetId,
      user: req.user._id,
    });

    if (!dataset) {
      return res
        .status(404)
        .json({ success: false, error: "Associated dataset not found" });
    }

    const chart = await SavedChart.create({
      user: req.user._id,
      dataset: datasetId,
      title:
        title || `${chartType.toUpperCase()} Chart - ${dataset.originalName}`,
      chartType,
      config: config || {},
    });

    res.status(201).json({
      success: true,
      message: "Chart configuration saved successfully",
      data: chart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all saved charts for logged in user
 * @route   GET /api/v1/charts
 * @access  Private
 */
const getUserSavedCharts = async (req, res, next) => {
  try {
    const charts = await SavedChart.find({ user: req.user._id })
      .populate("dataset", "originalName fileType rowCount columnCount")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: charts.length,
      data: charts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a saved chart configuration
 * @route   DELETE /api/v1/charts/:id
 * @access  Private
 */
const deleteSavedChart = async (req, res, next) => {
  try {
    const chart = await SavedChart.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chart) {
      return res
        .status(404)
        .json({ success: false, error: "Saved chart configuration not found" });
    }

    await chart.deleteOne();

    res.status(200).json({
      success: true,
      message: "Chart configuration deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDatasetInsights,
  saveChart,
  getUserSavedCharts,
  deleteSavedChart,
};
