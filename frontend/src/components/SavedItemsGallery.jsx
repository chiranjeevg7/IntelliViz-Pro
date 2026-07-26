import React, { useState, useEffect } from 'react';
import API from '../services/api';

const SavedItemsGallery = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [charts, setCharts] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setMsg({ text: '', isError: false });

      if (activeTab === 'charts') {
        const res = await API.get('/saved-items/charts');
        setCharts(res.data.data || []);
      } else {
        const res = await API.get('/saved-items/reports');
        setReports(res.data.data || []);
      }
    } catch (err) {
      setMsg({ text: 'Failed to load saved items.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChart = async (id) => {
    try {
      await API.delete(`/saved-items/charts/${id}`);
      setCharts((prev) => prev.filter((c) => c._id !== id));
      setMsg({ text: 'Chart deleted successfully.', isError: false });
    } catch (err) {
      setMsg({ text: 'Failed to delete chart.', isError: true });
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      await API.delete(`/saved-items/reports/${id}`);
      setReports((prev) => prev.filter((r) => r._id !== id));
      if (selectedReport?._id === id) setSelectedReport(null);
      setMsg({ text: 'Report deleted successfully.', isError: false });
    } catch (err) {
      setMsg({ text: 'Failed to delete report.', isError: true });
    }
  };

  const handleCopyReport = async (report) => {
    const text = report?.summaryText || report?.summary || '';
    try {
      await navigator.clipboard.writeText(text);
      setMsg({ text: '✅ Report briefing copied to clipboard.', isError: false });
      setTimeout(() => setMsg({ text: '', isError: false }), 2500);
    } catch (err) {
      setMsg({ text: 'Failed to copy report text.', isError: true });
    }
  };

  const downloadImage = (base64Img, title) => {
    const link = document.createElement('a');
    link.href = base64Img;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_chart.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>💾 Saved Items & History</h2>
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('charts')}
            style={activeTab === 'charts' ? styles.activeTabBtn : styles.tabBtn}
          >
            📊 Saved Charts ({charts.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            style={activeTab === 'reports' ? styles.activeTabBtn : styles.tabBtn}
          >
            📄 Saved Reports ({reports.length})
          </button>
        </div>
      </div>

      {msg.text && (
        <div style={msg.isError ? styles.errorBox : styles.successBox}>{msg.text}</div>
      )}

      {loading ? (
        <p style={styles.infoText}>Loading saved items...</p>
      ) : activeTab === 'charts' ? (
        <div style={styles.grid}>
          {charts.length === 0 ? (
            <p style={styles.emptyText}>No saved charts found.</p>
          ) : (
            charts.map((chart) => (
              <div key={chart._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>{chart.title}</h4>
                  <span style={styles.badge}>{(chart.chartType || 'chart').toUpperCase()}</span>
                </div>
                <p style={styles.meta}>Dataset: {chart.dataset?.originalName || 'N/A'}</p>
                <p style={styles.meta}>Axes: X = {chart.xAxis} {chart.yAxis ? `| Y = ${chart.yAxis}` : ''}</p>

                {chart.chartImage ? (
                  <img src={chart.chartImage} alt={chart.title} style={styles.previewImage} />
                ) : (
                  <div style={styles.noImg}>No Preview Available</div>
                )}

                <div style={styles.cardFooter}>
                  {chart.chartImage && (
                    <button
                      onClick={() => downloadImage(chart.chartImage, chart.title)}
                      style={styles.downloadBtn}
                    >
                      📥 Download
                    </button>
                  )}
                  <button onClick={() => handleDeleteChart(chart._id)} style={styles.deleteBtn}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={styles.list}>
          {reports.length === 0 ? (
            <p style={styles.emptyText}>No saved reports found.</p>
          ) : (
            reports.map((report) => (
              <div key={report._id} style={styles.listRow}>
                <div>
                  <h4 style={styles.cardTitle}>{report.title || 'Executive Briefing'}</h4>
                  <p style={styles.meta}>
                    Type: <strong>{report.reportType || 'Dataset'}</strong> | Dataset: {report.dataset?.originalName || 'N/A'} | Date: {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div style={styles.btnGroup}>
                  <button
                    onClick={() => setSelectedReport(report)}
                    style={styles.viewBtn}
                  >
                    👁️ View
                  </button>

                  <button
                    onClick={() => handleCopyReport(report)}
                    style={styles.copyBtn}
                  >
                    📋 Copy
                  </button>

                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    style={styles.deleteBtn}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedReport && (
        <div style={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{selectedReport.title || 'Executive Briefing'}</h3>
              <button
                onClick={() => setSelectedReport(null)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {selectedReport.summaryText || selectedReport.summary || 'No summary available.'}
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => handleCopyReport(selectedReport)}
                style={styles.copyBtn}
              >
                📋 Copy Text
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                style={styles.secondaryBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  tabs: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  tabBtn: { padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#475569' },
  activeTabBtn: { padding: '8px 16px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  listRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', gap: '12px', flexWrap: 'wrap' },
  card: { border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px' },
  cardTitle: { margin: 0, fontSize: '15px', color: '#0f172a' },
  badge: { background: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' },
  meta: { margin: '2px 0', fontSize: '12px', color: '#64748b' },
  previewImage: { width: '100%', height: '160px', objectFit: 'contain', margin: '12px 0', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1' },
  noImg: { height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' },
  cardFooter: { display: 'flex', gap: '8px', marginTop: '12px' },
  btnGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  downloadBtn: { flex: 1, padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  deleteBtn: { padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  viewBtn: { padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  copyBtn: { padding: '6px 12px', background: '#e2e8f0', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  secondaryBtn: { padding: '6px 12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  successBox: { padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
  errorBox: { padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' },
  infoText: { color: '#64748b', fontSize: '14px' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' },

  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' },
  modal: { backgroundColor: '#ffffff', width: '100%', maxWidth: '700px', maxHeight: '80vh', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' },
  modalTitle: { margin: 0, fontSize: '18px', color: '#0f172a' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' },
  modalBody: { flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', color: '#334155', lineHeight: '1.6' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', flexWrap: 'wrap' },
};

export default SavedItemsGallery;