import React, { useState } from 'react';
import API from '../services/api';

const ReportManager = ({ dataset, cleaningAuditLog = [], savedCharts = [] }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [briefingText, setBriefingText] = useState('');
  const [msg, setMsg] = useState({ text: '', isErr: false });

  if (!dataset) {
    return (
      <div style={styles.card}>
        <p style={styles.emptyText}>No active dataset selected.</p>
      </div>
    );
  }

  const columns = Array.isArray(dataset?.columns)
    ? dataset.columns
    : typeof dataset?.columns === 'object'
    ? Object.keys(dataset.columns)
    : [];

  const rawRows = dataset?.rows || dataset?.data || [];
  const rowsCount =
    dataset?.rowCount ||
    dataset?.rowsCount ||
    (Array.isArray(rawRows) ? rawRows.length : 0);

  const datasetId = dataset._id || dataset.id;
  const datasetName = dataset.originalName || dataset.name || 'Dataset';

  const buildCleaningHistory = () => {
    if (Array.isArray(cleaningAuditLog)) {
      return cleaningAuditLog.map((item) =>
        typeof item === 'object'
          ? item.action || item.message || JSON.stringify(item)
          : item,
      );
    }
    return [];
  };

  const buildDatasetMeta = () => ({
    originalName: dataset.originalName || dataset.name || 'Dataset',
    fileType: dataset.fileType || dataset.type || 'unknown',
    rowCount: rowsCount,
    columnCount: columns.length,
    savedChartsCount: Array.isArray(savedCharts) ? savedCharts.length : 0,
  });

  const buildAnalyticsMeta = () => ({
    qualityScore: dataset.qualityScore || 100,
    source: 'ReportManager',
  });

  const buildStatisticalDistributions = () => {
    const distributions = {};

    columns.forEach((col) => {
      const name = typeof col === 'object' ? col.name || col.key : col;
      if (!name) return;

      const values = rawRows
        .map((row) => Number(row?.[name]))
        .filter((v) => !Number.isNaN(v));

      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        distributions[name] = `Avg=${avg.toFixed(2)}, Min=${min}, Max=${max}`;
      }
    });

    return distributions;
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      setMsg({ text: '', isErr: false });

      const res = await API.post('/reports/generate', {
        datasetId,
        title: `Executive Briefing - ${datasetName}`,
        cleaningHistory: buildCleaningHistory(),
        analyticsMeta: buildAnalyticsMeta(),
        datasetMeta: buildDatasetMeta(),
        statisticalDistributions: buildStatisticalDistributions(),
      });

      const data = res.data?.data || res.data || {};
      setReportData(data);

      const generatedText =
        data.summaryText || data.summary || data.briefingText || '';

      setBriefingText(generatedText);
      setMsg({ text: '✅ Report generated and saved successfully.', isErr: false });
    } catch (err) {
      const colNames = columns
        .map((c) => (typeof c === 'object' ? c.name || c.key : c))
        .slice(0, 6)
        .join(', ');

      const fallbackSummary =
        `Executive Data Briefing:\n` +
        `• Target Dataset "${datasetName}" contains ${rowsCount.toLocaleString()} records across ${columns.length} columns.\n` +
        `• Key Schema Attributes: ${colNames || 'N/A'}.\n` +
        `• Data Health Score: Rated at ${dataset.qualityScore || 100}% structural integrity.\n` +
        `• Audit Activity: ${cleaningAuditLog.length} data transformations logged.\n` +
        `• Recommendation: Prepared for advanced analytical modeling and visualization.`;

      setReportData({ summary: fallbackSummary });
      setBriefingText(fallbackSummary);

      setMsg({
        text: err.response?.data?.error || '⚠️ Backend unavailable. Loaded fallback summary.',
        isErr: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReport = async () => {
    try {
      setMsg({ text: 'Saving...', isErr: false });

      await API.post('/saved-items/reports', {
        datasetId,
        title: `Executive Briefing - ${datasetName}`,
        summaryText:
          briefingText ||
          reportData?.summary ||
          `Dataset contains ${rowsCount} rows across ${columns.length} columns.`,
        metrics: {
          totalRows: rowsCount,
          totalColumns: columns.length,
          qualityScore: dataset.qualityScore || 100,
        },
      });

      setMsg({ text: '✅ Saved to Gallery!', isErr: false });
      setTimeout(() => setMsg({ text: '', isErr: false }), 3000);
    } catch (err) {
      setMsg({ text: '❌ Failed to save report.', isErr: true });
    }
  };

  const handleExportHTML = () => {
    const summaryText =
      briefingText ||
      reportData?.summary ||
      `Dataset contains ${rowsCount} records across ${columns.length} columns.`;

    const colNames = columns.map((c) =>
      typeof c === 'object' ? c.name || c.key : c,
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Executive Report - ${datasetName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; background: #f8fafc; color: #0f172a; }
          .card { background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          h1 { color: #0f172a; margin-top: 0; font-size: 22px; }
          h2 { color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-size: 16px; margin-top: 24px; }
          .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-top: 12px; }
          .stat-box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
          .stat-num { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stat-lbl { font-size: 12px; color: #64748b; font-weight: 600; }
          .briefing-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 0 8px 8px 0; white-space: pre-line; line-height: 1.6; }
          .badge { display: inline-block; padding: 4px 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 16px; font-size: 12px; margin: 4px; }
          .audit-list { padding-left: 20px; font-size: 13px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>📄 Executive Analytical Briefing</h1>
          <p style="color: #64748b; font-size: 13px;">Dataset: <strong>${datasetName}</strong> • Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="card">
          <h2>📌 Key Performance Indicators</h2>
          <div class="stat-grid">
            <div class="stat-box"><div class="stat-num">${rowsCount.toLocaleString()}</div><div class="stat-lbl">Total Records</div></div>
            <div class="stat-box"><div class="stat-num">${columns.length}</div><div class="stat-lbl">Total Attributes</div></div>
            <div class="stat-box"><div class="stat-num">${dataset.qualityScore || 100}%</div><div class="stat-lbl">Data Health Score</div></div>
            <div class="stat-box"><div class="stat-num">${cleaningAuditLog.length}</div><div class="stat-lbl">Audit Actions Logged</div></div>
          </div>

          <h2>🧠 Summary Briefing</h2>
          <div class="briefing-box">${summaryText}</div>

          <h2>📋 Attributes & Schema</h2>
          <div>${colNames.map((c) => `<span class="badge"><strong>${c}</strong></span>`).join('')}</div>

          ${
            cleaningAuditLog.length > 0
              ? `
            <h2>🧹 Transformation Audit Trail</h2>
            <ul class="audit-list">
              ${cleaningAuditLog
                .map((log) => `<li>${typeof log === 'object' ? log.action || JSON.stringify(log) : log}</li>`)
                .join('')}
            </ul>
          `
              : ''
          }
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Executive_Report_${datasetName.replace(/\s+/g, '_')}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      setMsg({ text: '❌ No raw rows available in current dataset state.', isErr: true });
      return;
    }

    const headers = Object.keys(rawRows[0]);
    const csvContent = [
      headers.join(','),
      ...rawRows.map((r) =>
        headers
          .map((h) => {
            const val = r[h] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${datasetName.replace(/\s+/g, '_')}_data_export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.card} className="report-container">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-container, .report-container * { visibility: visible; }
          .report-container { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>📄 AI Executive Data Summary</h3>
          <p style={styles.subtitle}>
            Target Dataset: <strong>{datasetName}</strong>
          </p>
        </div>
        <div style={styles.btnGroup} className="no-print">
          <button onClick={handleGenerateReport} disabled={isGenerating} style={styles.primaryBtn}>
            {isGenerating ? 'Generating...' : '⚡ Generate AI Briefing'}
          </button>
          <button onClick={handleSaveReport} style={styles.saveBtn}>
            💾 Save to Gallery
          </button>
          <button onClick={handleExportHTML} style={styles.htmlBtn}>
            🌐 Export HTML
          </button>
          <button onClick={handleExportCSV} style={styles.csvBtn}>
            📊 Export CSV
          </button>
          <button onClick={() => window.print()} style={styles.secondaryBtn}>
            🖨️ Print / PDF
          </button>
        </div>
      </div>

      {msg.text && <div style={msg.isErr ? styles.errorBox : styles.successBox}>{msg.text}</div>}

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>📌 Key Performance Indicators (KPIs)</h4>
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <span style={styles.statNumber}>{rowsCount.toLocaleString()}</span>
            <span style={styles.statLabel}>Total Records</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNumber}>{columns.length}</span>
            <span style={styles.statLabel}>Total Attributes</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNumber}>{dataset.qualityScore || 100}%</span>
            <span style={styles.statLabel}>Data Health Score</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNumber}>{cleaningAuditLog.length}</span>
            <span style={styles.statLabel}>Transformations Logged</span>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>🧠 Executive Summary Briefing</h4>
        <div style={styles.briefingBox}>
          <p style={styles.briefingText}>
            {briefingText ||
              reportData?.summary ||
              `This dataset comprises ${rowsCount.toLocaleString()} rows across ${columns.length} columns. Overall data health is rated at ${
                dataset.qualityScore || 100
              }%. Click "Generate AI Briefing" above to construct an automated executive analysis on trends, missing values, and anomalies.`}
          </p>
        </div>
      </div>

      {cleaningAuditLog.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>🧹 Cleaning & Transformation History</h4>
          <ul style={styles.auditList}>
            {cleaningAuditLog.map((log, idx) => (
              <li key={idx} style={styles.auditItem}>
                <span style={styles.auditBadge}>LOG</span>
                {typeof log === 'object' ? log.action || JSON.stringify(log) : log}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>📋 Field Schema & Data Types</h4>
        <div style={styles.badgeContainer}>
          {columns.map((col, idx) => {
            const name = typeof col === 'object' ? col.name || col.key : col;
            const type = typeof col === 'object' ? col.dataType || col.type || 'attribute' : 'field';
            return (
              <span key={idx} style={styles.badge}>
                <strong>{name}</strong> <small style={{ color: '#64748b' }}>({type})</small>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' },
  title: { margin: '0 0 4px 0', fontSize: '20px', color: '#0f172a' },
  subtitle: { margin: 0, fontSize: '13px', color: '#64748b' },
  btnGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  primaryBtn: { padding: '9px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  saveBtn: { padding: '9px 14px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  htmlBtn: { padding: '9px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  csvBtn: { padding: '9px 14px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  secondaryBtn: { padding: '9px 14px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  errorBox: { padding: '10px 14px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca' },
  successBox: { padding: '10px 14px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #a7f3d0' },
  section: { marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
  sectionTitle: { margin: '0 0 12px 0', fontSize: '15px', color: '#1e293b' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' },
  statBox: { padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' },
  statNumber: { display: 'block', fontSize: '22px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#64748b', fontWeight: '600' },
  briefingBox: { padding: '16px', backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', borderRadius: '0 8px 8px 0' },
  briefingText: { margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-line' },
  badgeContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  badge: { padding: '6px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '20px', fontSize: '12px' },
  auditList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' },
  auditItem: { fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' },
  auditBadge: { backgroundColor: '#e2e8f0', color: '#475569', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' },
  emptyText: { color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' },
};

export default ReportManager;
