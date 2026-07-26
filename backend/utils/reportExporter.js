/**
 * Report Exporter Utility
 * Handles HTML report formatting, CSV string building, and PDF/HTML exports
 */

/**
 * Converts array of row objects back to CSV string format
 */
const exportToCSV = (rows) => {
  if (!rows || rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const csvLines = [];

  // Header line
  csvLines.push(
    headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","),
  );

  // Data lines
  rows.forEach((row) => {
    const line = headers.map((header) => {
      const val =
        row[header] !== undefined && row[header] !== null ? row[header] : "";
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvLines.push(line.join(","));
  });

  return csvLines.join("\n");
};

/**
 * Generates standalone HTML executive report string
 */
const generateHTMLReport = (
  datasetName,
  metrics = {},
  insights = [],
  rowsPreview = [],
) => {
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const insightsHTML = insights
    .map((i) => {
      let badgeClass = "bg-info";
      if (i.severity === "warning") badgeClass = "bg-warning";
      if (i.severity === "critical") badgeClass = "bg-danger";

      return `
      <div class="insight-card">
        <span class="badge ${badgeClass}">${i.category}</span>
        <p class="insight-desc">${i.description}</p>
      </div>
    `;
    })
    .join("");

  const headers = rowsPreview.length > 0 ? Object.keys(rowsPreview[0]) : [];
  const tableHeadersHTML = headers.map((h) => `<th>${h}</th>`).join("");
  const tableRowsHTML = rowsPreview
    .map((row) => {
      const cols = headers
        .map(
          (h) =>
            `<td>${row[h] !== undefined && row[h] !== null ? String(row[h]) : ""}</td>`,
        )
        .join("");
      return `<tr>${cols}</tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Executive Analytics Report - ${datasetName}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; background-color: #f8f9fa; color: #333; }
    .container { max-width: 900px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { border-bottom: 2px solid #e9ecef; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; color: #1e293b; font-size: 28px; }
    .header p { margin: 0; color: #64748b; font-size: 14px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 35px; }
    .metric-box { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 5px; }
    .metric-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 10px; }
    .insight-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 12px; display: flex; align-items: center; gap: 15px; }
    .insight-desc { margin: 0; font-size: 14px; color: #334155; }
    .badge { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; color: white; text-transform: uppercase; }
    .bg-info { background-color: #3b82f6; }
    .bg-warning { background-color: #f59e0b; }
    .bg-danger { background-color: #ef4444; }
    .table-container { overflow-x: auto; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    th { background-color: #0f172a; color: white; padding: 10px; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Executive Analytics Report</h1>
      <p><strong>Dataset:</strong> ${datasetName} | <strong>Generated:</strong> ${dateStr}</p>
    </div>

    <div class="metrics-grid">
      <div class="metric-box">
        <div class="metric-value">${metrics.totalRows || 0}</div>
        <div class="metric-label">Total Rows</div>
      </div>
      <div class="metric-box">
        <div class="metric-value">${metrics.totalColumns || 0}</div>
        <div class="metric-label">Total Columns</div>
      </div>
      <div class="metric-box">
        <div class="metric-value">${metrics.qualityScore || 100}%</div>
        <div class="metric-label">Data Quality</div>
      </div>
      <div class="metric-box">
        <div class="metric-value">${metrics.duplicateCount || 0}</div>
        <div class="metric-label">Duplicates</div>
      </div>
    </div>

    <div class="section-title">Automated AI Insights</div>
    <div class="insights-container">
      ${insightsHTML}
    </div>

    ${
      rowsPreview.length > 0
        ? `
      <div class="section-title" style="margin-top: 35px;">Dataset Sample Preview</div>
      <div class="table-container">
        <table>
          <thead><tr>${tableHeadersHTML}</tr></thead>
          <tbody>${tableRowsHTML}</tbody>
        </table>
      </div>
    `
        : ""
    }

    <div class="footer">
      Generated automatically by IntelliViz Pro v2.0 Analytics Engine
    </div>
  </div>
</body>
</html>`;
};

module.exports = {
  exportToCSV,
  generateHTMLReport,
};
