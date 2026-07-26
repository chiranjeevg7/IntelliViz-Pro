const SavedChart = require("../models/SavedChart");
const Report = require("../models/Report");

// --- SAVED CHARTS ---
exports.saveChart = async (req, res, next) => {
  try {
    const { datasetId, title, chartType, xAxis, yAxis, chartImage, config } =
      req.body;

    const chart = await SavedChart.create({
      user: req.user._id,
      dataset: datasetId,
      title,
      chartType,
      xAxis,
      yAxis,
      chartImage,
      config,
    });

    res.status(201).json({
      success: true,
      message: "Chart saved successfully",
      data: chart,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSavedCharts = async (req, res, next) => {
  try {
    const charts = await SavedChart.find({ user: req.user._id })
      .populate("dataset", "originalName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: charts.length, data: charts });
  } catch (err) {
    next(err);
  }
};

exports.deleteSavedChart = async (req, res, next) => {
  try {
    const chart = await SavedChart.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chart)
      return res.status(404).json({ success: false, error: "Chart not found" });

    res
      .status(200)
      .json({ success: true, message: "Chart deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// --- SAVED REPORTS ---
exports.saveReport = async (req, res, next) => {
  try {
    const { datasetId, title, summaryText, metrics, insights, exportFormats } =
      req.body;

    const report = await Report.create({
      user: req.user._id,
      dataset: datasetId,
      title,
      summaryText: summaryText || "Generated Analytics Summary",
      metrics: metrics || {},
      insights: insights || [],
      exportFormats: exportFormats || [],
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Report saved successfully",
        data: report,
      });
  } catch (err) {
    next(err);
  }
};

exports.getSavedReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .populate("dataset", "originalName")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    next(err);
  }
};

exports.deleteSavedReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!report)
      return res
        .status(404)
        .json({ success: false, error: "Report not found" });

    res
      .status(200)
      .json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    next(err);
  }
};
