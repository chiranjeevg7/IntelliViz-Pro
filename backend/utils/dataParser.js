/**
 * Data Parser Utility
 * Reads CSV / Excel files from disk, converts to JSON, detects column types, and computes stats
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// Helper to handle commas inside quotes for CSVs
const parseCSVLine = (text) => {
  const result = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
};

// Dynamically parse CSV and cast types
const parseCSV = (filePath) => {
  if (!fs.existsSync(filePath)) return [];

  const fileContent = fs.readFileSync(filePath, "utf8");
  const lines = fileContent
    .split(/\r\n|\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const rowObj = {};
      headers.forEach((header, idx) => {
        let rawVal = values[idx] !== undefined ? values[idx].trim() : "";

        // Auto-cast valid numeric strings (excluding date patterns like "01-01-2023")
        const isNumberPattern =
          !isNaN(Number(rawVal)) &&
          rawVal !== "" &&
          !rawVal.includes("-") &&
          !rawVal.includes("/");

        rowObj[header.trim()] = isNumberPattern ? Number(rawVal) : rawVal;
      });
      rows.push(rowObj);
    }
  }

  return rows;
};

/**
 * Safely parse Excel files (.xlsx, .xls) into clean JSON.
 * Automatically skips top metadata/disclaimer banners and generates clean headers.
 */
const parseExcel = (filePath) => {
  if (!fs.existsSync(filePath)) return [];

  try {
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // 1. Read sheet as 2D matrix (header: 1 returns array of row arrays)
    const rawMatrix = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    });

    if (!rawMatrix || rawMatrix.length === 0) return [];

    // 2. Find real header row index (first row with >= 2 filled cells)
    let headerRowIndex = 0;
    for (let i = 0; i < rawMatrix.length; i++) {
      const nonNullCount = rawMatrix[i].filter(
        (cell) => cell !== null && cell !== "" && cell !== undefined,
      ).length;

      if (nonNullCount >= 2) {
        headerRowIndex = i;
        break;
      }
    }

    // 3. Extract and normalize header names
    const rawHeaders = rawMatrix[headerRowIndex] || [];
    const headers = rawHeaders.map((h, idx) => {
      const trimmed = String(h).trim();
      return trimmed.length > 0 ? trimmed : `Column_${idx + 1}`;
    });

    // 4. Transform remaining rows into clean JavaScript objects
    const dataRows = rawMatrix.slice(headerRowIndex + 1);

    const rows = dataRows
      .filter((row) =>
        row.some((cell) => cell !== "" && cell !== null && cell !== undefined),
      )
      .map((row) => {
        const rowObj = {};
        headers.forEach((header, colIdx) => {
          let val = row[colIdx] !== undefined ? row[colIdx] : "";

          // Clean string whitespace if applicable
          if (typeof val === "string") {
            val = val.trim();
          }

          // Auto-cast numeric values
          if (
            typeof val === "string" &&
            !isNaN(Number(val)) &&
            val !== "" &&
            !val.includes("-") &&
            !val.includes("/")
          ) {
            val = Number(val);
          }

          rowObj[header] = val;
        });
        return rowObj;
      });

    return rows;
  } catch (error) {
    console.error("Error parsing Excel file:", error.message);
    return [];
  }
};

// Auto-detect column data type reliably
const detectDataType = (values) => {
  let isNum = true;
  let isBool = true;
  let isDt = true;
  let nonNullCount = 0;

  for (const val of values) {
    if (val === null || val === undefined || val === "") continue;
    nonNullCount++;

    const strVal = String(val).trim();

    // Reject date strings from being detected as pure numbers (e.g. '01-01-2023')
    const looksLikeDate = strVal.includes("-") || strVal.includes("/");

    // Check Number
    if (typeof val !== "number" && (isNaN(Number(strVal)) || looksLikeDate)) {
      isNum = false;
    }

    // Check Boolean
    const lower = strVal.toLowerCase();
    if (lower !== "true" && lower !== "false") {
      isBool = false;
    }

    // Check Date
    if (isNaN(Date.parse(strVal)) || strVal.length < 5 || !looksLikeDate) {
      isDt = false;
    }
  }

  if (nonNullCount === 0) return "string";
  if (isNum) return "number";
  if (isBool) return "boolean";
  if (isDt) return "date";
  return "string";
};

// Analyze column metadata
const analyzeColumns = (rows) => {
  if (!rows || rows.length === 0) return [];

  const headers = Object.keys(rows[0]);

  return headers.map((header) => {
    const colValues = rows.map((r) => r[header]);
    const nullCount = colValues.filter(
      (v) => v === null || v === undefined || v === "",
    ).length;
    const uniqueValues = new Set(
      colValues.filter((v) => v !== null && v !== undefined && v !== ""),
    );

    return {
      name: header,
      dataType: detectDataType(colValues),
      nullCount: nullCount,
      uniqueCount: uniqueValues.size,
    };
  });
};

module.exports = {
  parseCSV,
  parseExcel,
  analyzeColumns,
};
