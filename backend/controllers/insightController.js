/**
 * Insight & Visualization Controller
 * Generates initial chart configurations and AI summary insights for a dataset.
 */

const Dataset = require("../models/Dataset");
const fs = require("fs");
const path = require("path");
const { parseCSV, parseExcel } = require("../utils/dataParser");

const readDatasetRows = (filePath, ext) => {
  const normalizedExt = (ext || path.extname(filePath))
    .toLowerCase()
    .replace(".", "");
  if (["xls", "xlsx"].includes(normalizedExt)) {
    return parseExcel(filePath);
  }
  return parseCSV(filePath);
};

/**
 * @desc    Get recommended chart configurations based on columns
 * @route   GET /api/v1/datasets/:id/charts
 * @access  Private
 */
const getRecommendedCharts = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dataset) {
      return res
        .status(404)
        .json({ success: false, error: "Dataset not found" });
    }

    const columns = dataset.columns || [];
    const numericCols = columns.filter((c) =>
      ["number", "integer", "float"].includes(c.dataType?.toLowerCase()),
    );
    const categoricalCols = columns.filter((c) =>
      ["string", "text", "category"].includes(c.dataType?.toLowerCase()),
    );

    // Build intelligent default chart configurations
    const recommendedCharts = [];

    if (categoricalCols.length > 0 && numericCols.length > 0) {
      recommendedCharts.push({
        id: "bar-1",
        title: `${numericCols[0].name} by ${categoricalCols[0].name}`,
        type: "bar",
        xAxis: categoricalCols[0].name,
        yAxis: numericCols[0].name,
      });
    }

    if (numericCols.length >= 2) {
      recommendedCharts.push({
        id: "scatter-1",
        title: `${numericCols[0].name} vs ${numericCols[1].name}`,
        type: "scatter",
        xAxis: numericCols[0].name,
        yAxis: numericCols[1].name,
      });
    }

    if (numericCols.length > 0) {
      recommendedCharts.push({
        id: "histogram-1",
        title: `Distribution of ${numericCols[0].name}`,
        type: "histogram",
        xAxis: numericCols[0].name,
        yAxis: null,
      });
    }

    res.status(200).json({
      success: true,
      data: recommendedCharts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate automated AI Dataset Insights
 * @route   GET /api/v1/datasets/:id/ai-insights
 * @access  Private
 */
const getAIInsights = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dataset) {
      return res
        .status(404)
        .json({ success: false, error: "Dataset not found" });
    }

    let rows = [];
    if (fs.existsSync(dataset.filePath)) {
      rows = readDatasetRows(dataset.filePath, dataset.fileType);
    }

    const totalRows = rows.length;
    const totalCols = dataset.columns ? dataset.columns.length : 0;
    const missingValuesTotal = dataset.columns
      ? dataset.columns.reduce((acc, col) => acc + (col.missingCount || 0), 0)
      : 0;

    // Generate basic heuristic insights (can be wired to an LLM/OpenAI endpoint later)
    const insights = [
      {
        type: "summary",
        title: "Dataset Overview",
        description: `The dataset contains ${totalRows.toLocaleString()} rows and ${totalCols} attributes. Overall completeness is ${
          missingValuesTotal === 0
            ? "100%"
            : `${Math.round((1 - missingValuesTotal / (totalRows * totalCols || 1)) * 100)}%`
        }.`,
      },
      {
        type: "quality",
        title: "Data Quality Status",
        description:
          missingValuesTotal === 0
            ? "No missing values detected. Dataset is ready for deep exploratory analysis."
            : `Detected ${missingValuesTotal} missing values across columns. Consider running fill/clean transformations.`,
      },
      {
        type: "recommendation",
        title: "Suggested Action",
        description:
          "Generate a Scatter plot between numerical features to inspect potential correlation or outliers.",
      },
    ];

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendedCharts,
  getAIInsights,
};
