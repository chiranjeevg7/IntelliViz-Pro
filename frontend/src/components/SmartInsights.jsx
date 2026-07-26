import React, { useState, useEffect } from 'react';
import API from '../services/api';

const SmartInsights = ({ datasetId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (datasetId) fetchInsights();
  }, [datasetId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/datasets/${datasetId}/insights`);
      setData(res.data.data);
    } catch (err) {
      setError('Failed to calculate dataset insights.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.card}>Analyzing dataset health...</div>;
  if (error) return <div style={styles.errorBox}>{error}</div>;
  if (!data) return null;

  const { qualityScore, summary, columnStats, correlations, insights } = data;

  // Score badge color
  const getScoreColor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 50) return '#d97706';
    return '#dc2626';
  };

  return (
    <div style={styles.container}>
      {/* Header & Quality Score */}
      <div style={styles.scoreCard}>
        <div>
          <h3 style={styles.title}>🧠 Smart Data Insights</h3>
          <p style={styles.subtitle}>Automated rule-based quality evaluation & statistics</p>
        </div>
        <div style={styles.scoreCircleGroup}>
          <div style={{ ...styles.scoreCircle, borderColor: getScoreColor(qualityScore) }}>
            <span style={{ ...styles.scoreVal, color: getScoreColor(qualityScore) }}>{qualityScore}%</span>
          </div>
          <span style={styles.scoreLabel}>Data Quality Score</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricItem}>
          <span style={styles.metricVal}>{summary.totalRows}</span>
          <span style={styles.metricLabel}>Total Rows</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricVal}>{summary.totalColumns}</span>
          <span style={styles.metricLabel}>Total Columns</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricVal}>{summary.totalMissingCells}</span>
          <span style={styles.metricLabel}>Missing Cells ({summary.missingPct}%)</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricVal}>{summary.duplicateCount}</span>
          <span style={styles.metricLabel}>Duplicate Rows</span>
        </div>
      </div>

      {/* Actionable Insights & Recommendations */}
      <h4 style={styles.sectionHeader}>⚡ Insights & Action Recommendations</h4>
      <div style={styles.insightsList}>
        {insights.map((item, i) => (
          <div key={i} style={styles.insightItem}>
            <div style={styles.insightTop}>
              <span style={styles.category}>{item.category}</span>
              <span
                style={{
                  ...styles.badge,
                  background:
                    item.severity === 'critical' ? '#fef2f2' : item.severity === 'warning' ? '#fffbebf' : '#eff6ff',
                  color:
                    item.severity === 'critical' ? '#dc2626' : item.severity === 'warning' ? '#b45309' : '#2563eb',
                }}
              >
                {item.severity.toUpperCase()}
              </span>
            </div>
            <p style={styles.desc}>{item.description}</p>
            <p style={styles.action}>💡 <strong>Recommendation:</strong> {item.action}</p>
          </div>
        ))}
      </div>

      {/* Numerical Stats Table */}
      <h4 style={styles.sectionHeader}>📊 Numerical Statistics Summary</h4>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Column Name</th>
              <th style={styles.th}>Min</th>
              <th style={styles.th}>Max</th>
              <th style={styles.th}>Mean</th>
              <th style={styles.th}>Median</th>
              <th style={styles.th}>Std Dev</th>
              <th style={styles.th}>Outliers</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(columnStats)
              .filter(([_, stat]) => stat.numericMetrics)
              .map(([colName, stat]) => (
                <tr key={colName}>
                  <td style={styles.td}><strong>{colName}</strong></td>
                  <td style={styles.td}>{stat.numericMetrics.min}</td>
                  <td style={styles.td}>{stat.numericMetrics.max}</td>
                  <td style={styles.td}>{stat.numericMetrics.mean}</td>
                  <td style={styles.td}>{stat.numericMetrics.median}</td>
                  <td style={styles.td}>{stat.numericMetrics.stdDev}</td>
                  <td style={styles.td}>{stat.numericMetrics.outlierCount}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px' },
  scoreCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
  title: { margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' },
  subtitle: { margin: 0, fontSize: '13px', color: '#64748b' },
  scoreCircleGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  scoreCircle: { width: '64px', height: '64px', borderRadius: '50%', border: '4px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
  scoreVal: { fontWeight: 'bold', fontSize: '16px' },
  scoreLabel: { fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: '600' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' },
  metricItem: { background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' },
  metricVal: { display: 'block', fontSize: '18px', fontWeight: 'bold', color: '#1e293b' },
  metricLabel: { fontSize: '11px', color: '#64748b' },
  sectionHeader: { margin: '16px 0 12px 0', fontSize: '15px', color: '#1e293b' },
  insightsList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  insightItem: { padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  insightTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  category: { fontWeight: '600', fontSize: '13px', color: '#0f172a' },
  badge: { fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' },
  desc: { margin: '0 0 6px 0', fontSize: '13px', color: '#334155' },
  action: { margin: 0, fontSize: '12px', color: '#475569' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  th: { padding: '10px', background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #cbd5e1' },
  td: { padding: '10px', borderBottom: '1px solid #e2e8f0', color: '#334155' },
  card: { padding: '16px', color: '#64748b', fontSize: '13px' },
  errorBox: { padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '13px' },
};

export default SmartInsights;