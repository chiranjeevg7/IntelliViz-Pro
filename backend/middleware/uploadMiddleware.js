/**
 * Multer File Upload Middleware
 * Section 4 (Dataset Management) & Section 14 (Security)
 * Handles file size validation, strict extension checks, and MIME type validation
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure target upload directory exists securely
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Engine Configuration with Sanitized Names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique sanitized filename: dataset-<timestamp>-<random>.<ext>
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `dataset-${uniqueSuffix}${ext}`);
  },
});

// Double Security Filter: Validates Extension & MIME Type (Section 14)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".csv", ".xlsx", ".xls"];
  const allowedMimeTypes = [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream", // Fallback for raw browser streaming
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const isExtValid = allowedExtensions.includes(ext);
  const isMimeValid = allowedMimeTypes.includes(mime);

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Security Error: File type "${ext}" or MIME type "${mime}" is not allowed. Only CSV and Excel (.xlsx, .xls) files are permitted.`,
      ),
      false,
    );
  }
};

// Multer Upload Instance with 25MB Strict Enforcement
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
});

module.exports = upload;
