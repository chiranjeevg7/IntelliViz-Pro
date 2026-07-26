/**
 * Dataset Cleaner Engine
 * Applies programmatic transformations on dataset JSON structures and writes modified CSV back to disk
 */

const fs = require("fs");

/**
 * Converts array of objects back into standard CSV text format
 */
const jsonToCSV = (rows) => {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerRow = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",");

  const bodyRows = rows.map((row) => {
    return headers
      .map((h) => {
        let val = row[h];
        if (val === null || val === undefined) val = "";
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(",");
  });

  return [headerRow, ...bodyRows].join("\n");
};

/**
 * Remove Duplicate Rows
 */
const removeDuplicates = (rows) => {
  const seen = new Set();
  const initialCount = rows.length;

  const cleanedRows = rows.filter((row) => {
    const serialized = JSON.stringify(row);
    if (seen.has(serialized)) {
      return false;
    }
    seen.add(serialized);
    return true;
  });

  const removedCount = initialCount - cleanedRows.length;
  return { cleanedRows, removedCount };
};

/**
 * Delete Column
 */
const deleteColumn = (rows, columnName) => {
  const cleanedRows = rows.map((row) => {
    const newRow = { ...row };
    delete newRow[columnName];
    return newRow;
  });
  return cleanedRows;
};

/**
 * Rename Column
 */
const renameColumn = (rows, oldName, newName) => {
  const cleanedRows = rows.map((row) => {
    const newRow = {};
    Object.keys(row).forEach((key) => {
      if (key === oldName) {
        newRow[newName] = row[key];
      } else {
        newRow[key] = row[key];
      }
    });
    return newRow;
  });
  return cleanedRows;
};

/**
 * Fill Missing Values
 */
const fillMissingValues = (
  rows,
  columnName,
  fillStrategy,
  customValue = "",
) => {
  // Strategy: 'custom', 'mean', 'mode', 'drop'
  if (fillStrategy === "drop") {
    return rows.filter(
      (r) =>
        r[columnName] !== null &&
        r[columnName] !== undefined &&
        r[columnName] !== "",
    );
  }

  let fillVal = customValue;

  if (fillStrategy === "mean") {
    const numericVals = rows
      .map((r) => Number(r[columnName]))
      .filter((v) => !isNaN(v));
    const sum = numericVals.reduce((acc, curr) => acc + curr, 0);
    fillVal =
      numericVals.length > 0 ? (sum / numericVals.length).toFixed(2) : "0";
  }

  return rows.map((r) => {
    if (
      r[columnName] === null ||
      r[columnName] === undefined ||
      r[columnName] === ""
    ) {
      return { ...r, [columnName]: String(fillVal) };
    }
    return r;
  });
};

module.exports = {
  jsonToCSV,
  removeDuplicates,
  deleteColumn,
  renameColumn,
  fillMissingValues,
};
