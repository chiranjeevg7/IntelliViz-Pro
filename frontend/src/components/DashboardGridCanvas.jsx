import React from 'react';

const DashboardGridCanvas = ({ dashboard, onRemoveChart }) => {
  if (!dashboard || !dashboard.charts || dashboard.charts.length === 0) {
    return (
      <div style={styles.emptyCanvas}>
        <p style={styles.emptyText}>🎨 Canvas is empty.</p>
        <p style={styles.emptySubtext}>Add saved charts to this dashboard to start building your layout.</p>
      </div>
    );
  }

  const columns = dashboard.layoutConfig?.columns || 2;

  return (
    <div style={{ ...styles.grid, gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {dashboard.charts.map((chart) => {
        const chartId = chart._id || chart.id;
        return (
          <div key={chartId} style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <div>
                <h4 style={styles.chartTitle}>{chart.title || 'Untitled Chart'}</h4>
                <span style={styles.chartMeta}>
                  Type: {chart.chartType?.toUpperCase()} | Dataset: {chart.dataset?.originalName || 'N/A'}
                </span>
              </div>
              {onRemoveChart && (
                <button
                  onClick={() => onRemoveChart(chartId)}
                  style={styles.removeBtn}
                  title="Remove from dashboard"
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.cardBody}>
              {/* Display chart configuration summary / representation */}
              <div style={styles.chartPlaceholder}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{chart.chartType?.toUpperCase()} CHART</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  X-Axis: {chart.xAxisKey || 'N/A'} | Y-Axis: {chart.yAxisKey || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gap: '20px',
    marginTop: '20px',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    justify: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '10px',
    marginBottom: '12px',
  },
  chartTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#0f172a',
  },
  chartMeta: {
    fontSize: '12px',
    color: '#64748b',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '2px 6px',
  },
  cardBody: {
    minHeight: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    width: '100%',
    padding: '30px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    textAlign: 'center',
  },
  emptyCanvas: {
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '2px dashed #cbd5e1',
    marginTop: '20px',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#334155',
    margin: '0 0 6px 0',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
};

export default DashboardGridCanvas;