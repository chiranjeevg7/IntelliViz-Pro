/**
 * Dataset Schema & Model
 * Tracks uploaded files, data types, dimensions, and cleaning logs
 */

const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["csv", "xlsx", "xls"],
      required: true,
    },
    fileSize: {
      type: Number, // In Bytes
      required: true,
    },
    rowCount: {
      type: Number,
      default: 0,
    },
    columnCount: {
      type: Number,
      default: 0,
    },
    // Array storing column details: name, detected data type, sample values
    columns: [
      {
        name: { type: String, required: true },
        dataType: {
          type: String,
          enum: ["number", "string", "boolean", "date", "unknown"],
          default: "string",
        },
        nullCount: { type: Number, default: 0 },
        uniqueCount: { type: Number, default: 0 },
      },
    ],
    // Audit log for cleaning actions applied to this dataset
    cleaningHistory: [
      {
        action: { type: String, required: true },
        details: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
  },
  {
    timestamps: true,
  },
);

// Indexing for faster dataset queries per user
datasetSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Dataset", datasetSchema);
