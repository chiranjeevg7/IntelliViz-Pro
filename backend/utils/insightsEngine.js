/**
 * Rule-Based Smart Data Insights Engine
 * Calculates metrics, outliers, correlation, quality scores, and recommendations.
 */

// Helper to determine if a value is numeric
const isNumeric = (val) => val !== null && val !== "" && !isNaN(Number(val));

// Calculate Mean
const getMean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

// Calculate Median
const getMedian = (arr) => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Calculate Standard Deviation
const getStdDev = (arr, mean) => {
  const variance =
    arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
};

// Outlier Detection via IQR (Interquartile Range)
const detectOutliersIQR = (arr) => {
  if (arr.length < 4) return { count: 0, bounds: { q1: 0, q3: 0, iqr: 0 } };
  const sorted = [...arr].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = sorted.filter((v) => v < lowerBound || v > upperBound);
  return { count: outliers.length, bounds: { lowerBound, upperBound } };
};

// Basic Pearson Correlation between two numeric arrays
const calculateCorrelation = (xArr, yArr) => {
  const n = xArr.length;
  if (n === 0) return 0;
  const meanX = getMean(xArr);
  const meanY = getMean(yArr);

  let num = 0,
    denX = 0,
    denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xArr[i] - meanX;
    const dy = yArr[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : Number((num / den).toFixed(2));
};

exports.generateSmartInsights = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      qualityScore: 0,
      summary: {
        totalRows: 0,
        totalColumns: 0,
        missingCount: 0,
        duplicateCount: 0,
      },
      columnStats: {},
      correlations: [],
      insights: [],
    };
  }

  const totalRows = rows.length;
  const colKeys = Object.keys(rows[0] || {});
  const totalColumns = colKeys.length;

  let totalMissingCells = 0;
  const columnStats = {};
  const numericColumns = {};

  // 1. Missing Value & Column Classification
  colKeys.forEach((col) => {
    let missingInCol = 0;
    const numericVals = [];

    rows.forEach((row) => {
      const val = row[col];
      if (
        val === null ||
        val === undefined ||
        String(val).trim() === "" ||
        String(val).toLowerCase() === "null"
      ) {
        missingInCol++;
        totalMissingCells++;
      } else if (isNumeric(val)) {
        numericVals.push(Number(val));
      }
    });

    const isNumCol = numericVals.length / totalRows > 0.6; // If >60% entries are numeric

    columnStats[col] = {
      missingCount: missingInCol,
      missingPct: Number(((missingInCol / totalRows) * 100).toFixed(1)),
      type: isNumCol ? "numeric" : "categorical",
    };

    if (isNumCol && numericVals.length > 0) {
      const mean = getMean(numericVals);
      const median = getMedian(numericVals);
      const stdDev = getStdDev(numericVals, mean);
      const { count: outlierCount } = detectOutliersIQR(numericVals);

      columnStats[col].numericMetrics = {
        min: Math.min(...numericVals),
        max: Math.max(...numericVals),
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        stdDev: Number(stdDev.toFixed(2)),
        outlierCount,
      };

      numericColumns[col] = numericVals;
    }
  });

  // 2. Duplicate Check
  const rowStrings = rows.map((r) => JSON.stringify(r));
  const uniqueCount = new Set(rowStrings).size;
  const duplicateCount = totalRows - uniqueCount;

  // 3. Correlation Summary
  const correlations = [];
  const numColKeys = Object.keys(numericColumns);
  for (let i = 0; i < numColKeys.length; i++) {
    for (let j = i + 1; j < numColKeys.length; j++) {
      const colA = numColKeys[i];
      const colB = numColKeys[j];
      const corrVal = calculateCorrelation(
        numericColumns[colA],
        numericColumns[colB],
      );
      if (Math.abs(corrVal) >= 0.4) {
        correlations.push({ colA, colB, value: corrVal });
      }
    }
  }

  // 4. Data Quality Score Calculation (100% max)
  const totalCells = totalRows * totalColumns;
  const missingPenalty = (totalMissingCells / totalCells) * 50; // Max 50 pt deduction
  const duplicatePenalty = (duplicateCount / totalRows) * 30; // Max 30 pt deduction
  const qualityScore = Math.max(
    0,
    Math.round(100 - missingPenalty - duplicatePenalty),
  );

  // 5. Actionable Insights & Recommendations Generator
  const insights = [];

  if (duplicateCount > 0) {
    insights.push({
      category: "Duplicate Records",
      description: `Detected ${duplicateCount} exact duplicate row(s) (${((duplicateCount / totalRows) * 100).toFixed(1)}% of dataset).`,
      severity: duplicateCount / totalRows > 0.1 ? "critical" : "warning",
      action: "Use the Auto-Deduplicate feature in Data Cleaning.",
    });
  }

  Object.entries(columnStats).forEach(([col, stat]) => {
    if (stat.missingPct > 0) {
      insights.push({
        category: "Missing Values",
        description: `Column "${col}" has ${stat.missingCount} missing values (${stat.missingPct}% missing).`,
        severity: stat.missingPct > 20 ? "critical" : "warning",
        action: `Impute missing values in "${col}" using Mean/Median/Mode or drop rows.`,
      });
    }

    if (stat.numericMetrics && stat.numericMetrics.outlierCount > 0) {
      insights.push({
        category: "Outliers Detected",
        description: `Column "${col}" contains ${stat.numericMetrics.outlierCount} potential outlier value(s).`,
        severity: "info",
        action: `Review high/low distribution values in "${col}".`,
      });
    }
  });

  correlations.forEach((c) => {
    insights.push({
      category: "Correlation Insights",
      description: `Strong correlation (${c.value}) detected between "${c.colA}" and "${c.colB}".`,
      severity: "info",
      action:
        "Consider analyzing these variables together in scatter or line charts.",
    });
  });

  if (insights.length === 0) {
    insights.push({
      category: "Data Health",
      description:
        "Your dataset is clean with zero duplicate rows or missing values!",
      severity: "info",
      action: "Proceed to Data Visualization or Report Generation.",
    });
  }

  return {
    qualityScore,
    summary: {
      totalRows,
      totalColumns,
      totalMissingCells,
      duplicateCount,
      missingPct: Number(((totalMissingCells / totalCells) * 100).toFixed(1)),
    },
    columnStats,
    correlations,
    insights,
  };
};
