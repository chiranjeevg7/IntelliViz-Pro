// backend/utils/reportEngine.js

/**
 * Generates an executive summary briefing combining dataset statistics,
 * data cleaning actions, analytics metadata, and statistical distributions.
 */
const generateExecutiveBriefing = ({
  datasetName,
  records = [],
  cleaningHistory = [],
  analyticsMeta = {},
  datasetMeta = {},
  statisticalDistributions = {},
}) => {
  const totalRows = records.length;

  if (totalRows === 0) {
    return "No records found in target dataset. Please upload or clean a dataset first.";
  }

  const keys = Object.keys(records[0] || {});
  const totalCols = keys.length;

  let missingCount = 0;
  const numericCols = [];
  const categoricalCols = [];

  keys.forEach((key) => {
    const sample = records.find(
      (r) => r[key] !== null && r[key] !== undefined,
    )?.[key];

    if (
      typeof sample === "number" ||
      (!isNaN(sample) && sample !== "" && sample !== null)
    ) {
      numericCols.push(key);
    } else {
      categoricalCols.push(key);
    }
  });

  records.forEach((row) => {
    keys.forEach((k) => {
      if (row[k] === null || row[k] === undefined || row[k] === "") {
        missingCount++;
      }
    });
  });

  const totalCells = totalRows * totalCols;
  const healthScore = Math.max(
    0,
    Math.round(((totalCells - missingCount) / totalCells) * 100),
  );

  const numericSummaries = numericCols
    .map((col) => {
      const vals = records.map((r) => Number(r[col])).filter((v) => !isNaN(v));
      if (!vals.length) return null;

      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = (sum / vals.length).toFixed(2);
      const min = Math.min(...vals);
      const max = Math.max(...vals);

      return `• ${col}: Avg = ${avg} | Range = [${min} to ${max}] | Total = ${sum.toLocaleString()}`;
    })
    .filter(Boolean);

  const formattedCleaningLogs =
    cleaningHistory.length > 0
      ? cleaningHistory.map((item) => `- ${item}`).join("\n")
      : "- Zero manual cleaning transformations were required or logged.";

  const datasetMetaLines = Object.entries(datasetMeta)
    .map(([key, value]) => `• ${key}: ${value}`)
    .join("\n");

  const analyticsMetaLines = Object.entries(analyticsMeta)
    .map(([key, value]) => `• ${key}: ${value}`)
    .join("\n");

  const distributionLines =
    Object.keys(statisticalDistributions).length > 0
      ? Object.entries(statisticalDistributions)
          .map(([col, dist]) => {
            if (typeof dist === "string") {
              return `• ${col}: ${dist}`;
            }

            if (dist && typeof dist === "object") {
              return `• ${col}: ${JSON.stringify(dist)}`;
            }

            return `• ${col}: N/A`;
          })
          .join("\n")
      : "• No statistical distribution data supplied.";

  return `
======================================================
📊 EXECUTIVE SUMMARY BRIEFING: ${(datasetName || "DATASET").toUpperCase()}
======================================================

1. DATASET METRICS & INTEGRITY OVERVIEW
• Total Sample Size: ${totalRows} rows across ${totalCols} columns.
• Calculated Health Score: ${healthScore}% Integrity (${missingCount} empty cells).
• Feature Breakdown: ${numericCols.length} Numerical attributes, ${categoricalCols.length} Categorical dimensions.
${datasetMetaLines ? `• Dataset Metadata:\n${datasetMetaLines}` : ""}

2. STATISTICAL DISTRIBUTIONS & KEY HIGHLIGHTS
${numericSummaries.length > 0 ? numericSummaries.join("\n") : "• No numerical attributes detected for summary calculation."}
${distributionLines ? `\n${distributionLines}` : ""}

3. DATA INSPECTION & CLEANING TRANSFORMATIONS LOG
${formattedCleaningLogs}

4. ANALYTICS METADATA
${analyticsMetaLines || "• No analytics metadata supplied."}

5. STRATEGIC INSIGHTS & NEXT STEPS
• Pipeline Optimization: ${
    missingCount > 0
      ? `Target ${missingCount} null cells using mean/median imputation in the Data Cleaning tab.`
      : "Data health is optimal at 100%."
  }
• Analytics Focus: Focus exploratory modeling on core quantitative variables (${
    numericCols.slice(0, 3).join(", ") || "N/A"
  }).
  `.trim();
};

module.exports = { generateExecutiveBriefing };
