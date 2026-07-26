/**
 * Rule-Based AI Data Quality & Insight Engine
 * Generates quality scores, statistical summaries, and recommended charts.
 */

const calculatePearsonCorrelation = (x, y) => {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }

  const denominator = Math.sqrt(denX * denY);
  if (denominator === 0) return 0;

  return Number((num / denominator).toFixed(3));
};

export const analyzeDataset = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      qualityScore: 0,
      totalRows: 0,
      totalColumns: 0,
      insights: ["Dataset is empty or invalid."],
      recommendedCharts: [],
      correlations: [],
    };
  }

  const totalRows = data.length;
  const columns = Object.keys(data[0] || {});
  const totalColumns = columns.length;
  const totalCells = totalRows * totalColumns;

  let totalNulls = 0;
  const columnNullCounts = {};
  const columnTypes = {};
  const numericColumns = [];

  // 1. Analyze Columns & Types
  columns.forEach((col) => {
    let nullCount = 0;
    let numericCount = 0;

    data.forEach((row) => {
      const val = row[col];
      if (
        val === null ||
        val === undefined ||
        val === "" ||
        String(val).trim() === ""
      ) {
        nullCount++;
      } else if (!isNaN(Number(val))) {
        numericCount++;
      }
    });

    columnNullCounts[col] = nullCount;
    totalNulls += nullCount;

    const validCount = totalRows - nullCount;
    if (validCount > 0 && numericCount / validCount >= 0.8) {
      columnTypes[col] = "numeric";
      numericColumns.push(col);
    } else {
      columnTypes[col] = "categorical";
    }
  });

  // 2. Duplicate Detection
  const rowStrings = data.map((r) => JSON.stringify(r));
  const uniqueRows = new Set(rowStrings);
  const duplicateRows = totalRows - uniqueRows.size;

  // 3. Compute Data Quality Score (0 - 100)
  const nullPercentage = totalCells > 0 ? totalNulls / totalCells : 0;
  const duplicatePercentage = totalRows > 0 ? duplicateRows / totalRows : 0;

  const nullPenalty = Math.min(40, Math.round(nullPercentage * 100 * 0.8));
  const duplicatePenalty = Math.min(
    30,
    Math.round(duplicatePercentage * 100 * 0.6),
  );

  const qualityScore = Math.max(0, 100 - nullPenalty - duplicatePenalty);

  // 4. Generate Natural Language Insights
  const insights = [];

  if (qualityScore >= 85) {
    insights.push(
      `High data quality (${qualityScore}/100). The dataset is well-structured with minimal missing entries.`,
    );
  } else if (qualityScore >= 60) {
    insights.push(
      `Moderate data quality (${qualityScore}/100). Consider cleaning missing or duplicate values before deep analysis.`,
    );
  } else {
    insights.push(
      `Low data quality (${qualityScore}/100). High presence of missing cells or duplicate records detected.`,
    );
  }

  if (duplicateRows > 0) {
    insights.push(
      `Detected ${duplicateRows} duplicate row(s) (${(duplicatePercentage * 100).toFixed(1)}% of total dataset).`,
    );
  } else {
    insights.push(`Zero duplicate rows detected.`);
  }

  const highNullCols = Object.entries(columnNullCounts).filter(
    ([_, count]) => count / totalRows > 0.15,
  );
  if (highNullCols.length > 0) {
    const colNames = highNullCols.map(([col]) => col).join(", ");
    insights.push(
      `Columns with >15% missing data: [${colNames}]. Recommended to run Data Cleaning.`,
    );
  }

  // 5. Compute Correlations for Numeric Pairs
  const correlations = [];
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const colA = numericColumns[i];
      const colB = numericColumns[j];

      const xVals = [];
      const yVals = [];

      data.forEach((row) => {
        const valA = Number(row[colA]);
        const valB = Number(row[colB]);
        if (!isNaN(valA) && !isNaN(valB)) {
          xVals.push(valA);
          yVals.push(valB);
        }
      });

      const r = calculatePearsonCorrelation(xVals, yVals);
      correlations.push({ colA, colB, score: r });

      if (Math.abs(r) >= 0.7) {
        insights.push(
          `Strong correlation (${r}) detected between '${colA}' and '${colB}'.`,
        );
      }
    }
  }

  // 6. Recommended Visualizations
  const recommendedCharts = [];
  if (numericColumns.length >= 2) {
    const topCorr = [...correlations].sort(
      (a, b) => Math.abs(b.score) - Math.abs(a.score),
    )[0];
    if (topCorr) {
      recommendedCharts.push({
        type: "scatter",
        xAxis: topCorr.colA,
        yAxis: topCorr.colB,
        title: `${topCorr.colA} vs ${topCorr.colB} (Correlation: ${topCorr.score})`,
      });
    }
  }

  const categoricalCols = columns.filter(
    (c) => columnTypes[c] === "categorical",
  );
  if (categoricalCols.length > 0 && numericColumns.length > 0) {
    recommendedCharts.push({
      type: "bar",
      xAxis: categoricalCols[0],
      yAxis: numericColumns[0],
      title: `${numericColumns[0]} by ${categoricalCols[0]}`,
    });
  }

  return {
    qualityScore,
    totalRows,
    totalColumns,
    nullCells: totalNulls,
    duplicateRows,
    numericColumns,
    categoricalColumns: categoricalCols,
    insights,
    recommendedCharts,
    correlations,
  };
};
