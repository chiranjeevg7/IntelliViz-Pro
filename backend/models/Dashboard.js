/**
 * Dashboard Mongoose Model
 * Stores multi-chart dashboard configurations for users
 */

const mongoose = require("mongoose");

const DashboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a dashboard title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
    },
    charts: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SavedChart",
      },
    ],
    layoutConfig: {
      type: Object,
      default: { columns: 2, theme: "light" },
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Dashboard", DashboardSchema);
