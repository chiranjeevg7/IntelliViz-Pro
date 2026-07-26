/**
 * Report Schema & Model
 * Stores generated analytics summaries and report metadata
 */

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Report title is required"],
      trim: true,
    },
    summaryText: {
      type: String,
      required: true,
    },
    metrics: {
      totalRows: Number,
      totalColumns: Number,
      duplicateCount: Number,
      missingValuesCount: Number,
      qualityScore: Number,
    },
    insights: [
      {
        category: { type: String, required: true }, // e.g., 'Summary', 'Missing Value', 'Correlation'
        description: { type: String, required: true },
        severity: {
          type: String,
          enum: ["info", "warning", "critical"],
          default: "info",
        },
      },
    ],
    exportFormats: [
      {
        type: { type: String, enum: ["html", "csv", "pdf"] },
        filePath: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Report", reportSchema);
