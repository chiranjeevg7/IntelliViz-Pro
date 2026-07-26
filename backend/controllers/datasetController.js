/**
 * Dataset Controller
 * Handles dataset uploading, parsing, metadata listing, cleaning operations, and deletion
 */

const fs = require("fs");
const path = require("path");
const Dataset = require("../models/Dataset");
const { parseCSV, parseExcel, analyzeColumns } = require("../utils/dataParser");
const {
  jsonToCSV,
  removeDuplicates,
  deleteColumn,
  renameColumn,
  fillMissingValues,
} = require("../utils/cleanerEngine");

const { generateSmartInsights } = require("../utils/insightsEngine");

/**
 * Helper to safely delete a file from disk
 */
const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Failed to delete file at ${filePath}:`, err.message);
    }
  }
};

/**
 * Helper to safely read rows from CSV or Excel files
 */
const readDatasetRows = (filePath, ext) => {
  const normalizedExt = (ext || path.extname(filePath))
    .toLowerCase()
    .replace(".", "");
  if (["xls", "xlsx"].includes(normalizedExt)) {
    if (typeof parseExcel === "function") {
      return parseExcel(filePath);
    }
    throw new Error("Excel parser utility is not properly defined.");
  }
  return parseCSV(filePath);
};

/**
 * @desc    Upload a new dataset file (CSV/Excel)
 * @route   POST /api/v1/datasets/upload
 * @access  Private
 */
const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a CSV or Excel file",
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const filename = req.file.filename;
    const fileSize = req.file.size;
    const ext = path.extname(originalName).toLowerCase().replace(".", "");

    let parsedRows = [];

    // Parse according to extension safely
    if (["csv", "xls", "xlsx"].includes(ext)) {
      parsedRows = readDatasetRows(filePath, ext);
    } else {
      safeUnlink(filePath);
      return res.status(400).json({
        success: false,
        error: "Unsupported file extension. Please upload CSV or Excel files.",
      });
    }

    // 🔍 DEBUG LOGS
    console.log("📁 Uploaded File Path:", filePath);
    console.log("📊 Parsed Rows Count:", parsedRows.length);
    console.log("👀 First Row Sample:", parsedRows[0]);

    if (!Array.isArray(parsedRows) || parsedRows.length === 0) {
      safeUnlink(filePath);
      return res.status(400).json({
        success: false,
        error: "The uploaded file is empty or contains no valid rows.",
      });
    }

    const columnsMetadata = analyzeColumns(parsedRows);

    // Create dataset record in DB
    const dataset = await Dataset.create({
      user: req.user._id,
      originalName,
      filename,
      filePath,
      fileType: ext,
      fileSize,
      rowCount: parsedRows.length,
      columnCount: columnsMetadata.length,
      columns: columnsMetadata,
      cleaningHistory: [
        {
          action: "Initial Upload",
          details: `Uploaded ${parsedRows.length} rows and ${columnsMetadata.length} columns.`,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Dataset uploaded and processed successfully",
      data: dataset,
    });
  } catch (error) {
    // Cleanup disk file on error
    if (req.file) {
      safeUnlink(req.file.path);
    }
    next(error);
  }
};

/**
 * @desc    Get all datasets uploaded by logged-in user
 * @route   GET /api/v1/datasets
 * @access  Private
 */
const getUserDatasets = async (req, res, next) => {
  try {
    const datasets = await Dataset.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: datasets.length,
      data: datasets,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get single dataset details & raw data preview
 * @route   GET /api/v1/datasets/:id
 * @access  Private
 */
const getDatasetById = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: "Dataset not found",
      });
    }

    // Read preview rows with simple pagination support
    const limit = parseInt(req.query.limit, 10) || 100;
    const page = parseInt(req.query.page, 10) || 1;
    const startIndex = (page - 1) * limit;

    let previewRows = [];
    if (fs.existsSync(dataset.filePath)) {
      const allRows = readDatasetRows(dataset.filePath, dataset.fileType);
      previewRows = allRows.slice(startIndex, startIndex + limit);
    }

    res.status(200).json({
      success: true,
      data: {
        dataset,
        previewRows,
        rows: previewRows, // 👈 Added alias so frontend `data.rows` works!
        pagination: {
          page,
          limit,
          totalRows: dataset.rowCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply Data Cleaning transformations
 * @route   POST /api/v1/datasets/:id/clean
 * @access  Private
 */
const cleanDataset = async (req, res, next) => {
  try {
    const { action, columnName, newName, fillStrategy, customValue } = req.body;

    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dataset) {
      return res
        .status(404)
        .json({ success: false, error: "Dataset not found" });
    }

    if (!fs.existsSync(dataset.filePath)) {
      return res.status(400).json({
        success: false,
        error: "Dataset source file missing on server",
      });
    }

    let rows = readDatasetRows(dataset.filePath, dataset.fileType);
    let auditDetail = "";

    switch (action) {
      case "remove_duplicates": {
        const { cleanedRows, removedCount } = removeDuplicates(rows);
        rows = cleanedRows;
        auditDetail = `Removed ${removedCount} duplicate rows.`;
        break;
      }
      case "delete_column": {
        if (!columnName) {
          return res
            .status(400)
            .json({ success: false, error: "columnName is required" });
        }
        rows = deleteColumn(rows, columnName);
        auditDetail = `Deleted column "${columnName}".`;
        break;
      }
      case "rename_column": {
        if (!columnName || !newName) {
          return res.status(400).json({
            success: false,
            error: "Both columnName and newName are required",
          });
        }
        rows = renameColumn(rows, columnName, newName);
        auditDetail = `Renamed column "${columnName}" to "${newName}".`;
        break;
      }
      case "fill_missing": {
        if (!columnName || !fillStrategy) {
          return res.status(400).json({
            success: false,
            error: "Both columnName and fillStrategy are required",
          });
        }
        rows = fillMissingValues(rows, columnName, fillStrategy, customValue);
        auditDetail = `Filled missing values in "${columnName}" using strategy: ${fillStrategy}.`;
        break;
      }
      default:
        return res
          .status(400)
          .json({ success: false, error: "Invalid cleaning action requested" });
    }

    // Save cleaned dataset back to file
    const updatedCSV = jsonToCSV(rows);
    fs.writeFileSync(dataset.filePath, updatedCSV, "utf8");

    // Re-analyze dataset metadata
    const updatedColumns = analyzeColumns(rows);

    dataset.rowCount = rows.length;
    dataset.columnCount = updatedColumns.length;
    dataset.columns = updatedColumns;
    dataset.cleaningHistory.push({
      action,
      details: auditDetail,
    });

    await dataset.save();

    res.status(200).json({
      success: true,
      message: "Dataset cleaned successfully",
      data: {
        dataset,
        previewRows: rows.slice(0, 100),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a dataset and remove file from disk
 * @route   DELETE /api/v1/datasets/:id
 * @access  Private
 */
const deleteDataset = async (req, res, next) => {
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

    // Safely remove file on disk
    safeUnlink(dataset.filePath);

    await dataset.deleteOne();

    res.status(200).json({
      success: true,
      message: "Dataset removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Rule-Based Smart Data Insights
// @route   GET /api/v1/datasets/:id/insights
// @access  Private
const getDatasetInsights = async (req, res, next) => {
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

    const insightsData = generateSmartInsights(rows);

    res.status(200).json({
      success: true,
      data: insightsData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDataset,
  getUserDatasets,
  getDatasetById,
  getDatasetInsights,
  cleanDataset,
  deleteDataset,
};
