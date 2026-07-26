/**
 * Dashboard Controller
 * Handles CRUD operations for multi-chart dashboard canvases
 */

const Dashboard = require("../models/Dashboard");
const SavedChart = require("../models/SavedChart");

/**
 * @desc    Create a new dashboard
 * @route   POST /api/v1/dashboards
 * @access  Private
 */
const createDashboard = async (req, res, next) => {
  try {
    const { title, description, charts, layoutConfig, isPublic } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide a dashboard title" });
    }

    const dashboard = await Dashboard.create({
      user: req.user._id,
      title,
      description,
      charts: charts || [],
      layoutConfig: layoutConfig || {},
      isPublic: isPublic || false,
    });

    res.status(201).json({
      success: true,
      message: "Dashboard created successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all dashboards for logged-in user
 * @route   GET /api/v1/dashboards
 * @access  Private
 */
const getUserDashboards = async (req, res, next) => {
  try {
    const dashboards = await Dashboard.find({ user: req.user._id })
      .populate("charts")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dashboards.length,
      data: dashboards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single dashboard by ID with populated charts
 * @route   GET /api/v1/dashboards/:id
 * @access  Private
 */
const getDashboardById = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate({
      path: "charts",
      populate: { path: "dataset", select: "originalName" },
    });

    if (!dashboard) {
      return res
        .status(404)
        .json({ success: false, error: "Dashboard not found" });
    }

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a dashboard
 * @route   PUT /api/v1/dashboards/:id
 * @access  Private
 */
const updateDashboard = async (req, res, next) => {
  try {
    let dashboard = await Dashboard.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dashboard) {
      return res
        .status(404)
        .json({ success: false, error: "Dashboard not found" });
    }

    dashboard = await Dashboard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("charts");

    res.status(200).json({
      success: true,
      message: "Dashboard updated successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a dashboard
 * @route   DELETE /api/v1/dashboards/:id
 * @access  Private
 */
const deleteDashboard = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dashboard) {
      return res
        .status(404)
        .json({ success: false, error: "Dashboard not found" });
    }

    await dashboard.deleteOne();

    res.status(200).json({
      success: true,
      message: "Dashboard deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDashboard,
  getUserDashboards,
  getDashboardById,
  updateDashboard,
  deleteDashboard,
};
