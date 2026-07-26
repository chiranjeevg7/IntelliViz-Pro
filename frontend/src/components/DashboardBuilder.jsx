import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  getDashboards,
  createDashboard,
  updateDashboard,
  deleteDashboard,
} from '../services/dashboardService';
import DashboardGridCanvas from './DashboardGridCanvas';

const DashboardBuilder = () => {
  const [dashboards, setDashboards] = useState([]);
  const [activeDashboard, setActiveDashboard] = useState(null);
  const [savedCharts, setSavedCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State for Dashboard Creation/Editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState(2);
  const [selectedChartId, setSelectedChartId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDashboardsAndCharts();
  }, []);

  const loadDashboardsAndCharts = async () => {
    setIsLoading(true);
    try {
      const [dashRes, chartsRes] = await Promise.all([
        getDashboards(),
        API.get('/saved-charts').catch(() => ({ data: { data: [] } })),
      ]);

      const fetchedDashboards = dashRes.data || [];
      setDashboards(fetchedDashboards);

      let fetchedCharts = [];
      if (Array.isArray(chartsRes.data)) fetchedCharts = chartsRes.data;
      else if (Array.isArray(chartsRes.data?.data)) fetchedCharts = chartsRes.data.data;
      setSavedCharts(fetchedCharts);

      if (fetchedDashboards.length > 0 && !activeDashboard) {
        setActiveDashboard(fetchedDashboards[0]);
        setTitle(fetchedDashboards[0].title);
        setDescription(fetchedDashboards[0].description || '');
        setColumns(fetchedDashboards[0].layoutConfig?.columns || 2);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDashboard = (dashboard) => {
    setActiveDashboard(dashboard);
    setTitle(dashboard.title);
    setDescription(dashboard.description || '');
    setColumns(dashboard.layoutConfig?.columns || 2);
  };

  const handleCreateNewDashboard = async () => {
    if (!title.trim()) {
      setMessage('Please enter a dashboard title.');
      return;
    }

    try {
      const res = await createDashboard({
        title,
        description,
        layoutConfig: { columns },
        charts: [],
      });
      setMessage('Dashboard created successfully!');
      setTitle('');
      setDescription('');
      await loadDashboardsAndCharts();
      if (res.data) setActiveDashboard(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to create dashboard.');
    }
  };

  const handleAddChartToDashboard = async () => {
    if (!activeDashboard || !selectedChartId) return;

    const currentChartIds = (activeDashboard.charts || []).map((c) => c._id || c.id || c);
    if (currentChartIds.includes(selectedChartId)) {
      setMessage('Chart is already added to this dashboard.');
      return;
    }

    const updatedChartIds = [...currentChartIds, selectedChartId];

    try {
      const res = await updateDashboard(activeDashboard._id, {
        charts: updatedChartIds,
        layoutConfig: { columns },
      });
      setActiveDashboard(res.data);
      setMessage('Chart added to dashboard!');
      setSelectedChartId('');
      loadDashboardsAndCharts();
    } catch (err) {
      console.error(err);
      setMessage('Failed to add chart.');
    }
  };

  const handleRemoveChartFromDashboard = async (chartId) => {
    if (!activeDashboard) return;

    const updatedChartIds = (activeDashboard.charts || [])
      .map((c) => c._id || c.id || c)
      .filter((id) => id !== chartId);

    try {
      const res = await updateDashboard(activeDashboard._id, {
        charts: updatedChartIds,
      });
      setActiveDashboard(res.data);
      setMessage('Chart removed from dashboard.');
      loadDashboardsAndCharts();
    } catch (err) {
      console.error(err);
      setMessage('Failed to remove chart.');
    }
  };

  const handleDeleteDashboard = async () => {
    if (!activeDashboard) return;
    if (!window.confirm('Are you sure you want to delete this dashboard?')) return;

    try {
      await deleteDashboard(activeDashboard._id);
      setActiveDashboard(null);
      setMessage('Dashboard deleted.');
      await loadDashboardsAndCharts();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete dashboard.');
    }
  };

  if (isLoading) {
    return <div style={styles.loading}>Loading Dashboard Studio...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h3 style={styles.sectionTitle}>📌 Multi-Chart Dashboard Studio</h3>
        {message && <span style={styles.alert}>{message}</span>}
      </div>

      {/* Control Panel */}
      <div style={styles.panel}>
        <div style={styles.panelSection}>
          <label style={styles.label}>Select Dashboard:</label>
          <select
            style={styles.select}
            value={activeDashboard?._id || ''}
            onChange={(e) => {
              const selected = dashboards.find((d) => d._id === e.target.value);
              if (selected) handleSelectDashboard(selected);
            }}
          >
            {dashboards.map((d) => (
              <option key={d._id} value={d._id}>
                {d.title} ({d.charts?.length || 0} charts)
              </option>
            ))}
          </select>
        </div>

        {/* Create / Edit Form Inline */}
        <div style={styles.panelSection}>
          <input
            type="text"
            placeholder="New Dashboard Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleCreateNewDashboard} style={styles.btnPrimary}>
            + Create New
          </button>
        </div>
      </div>

      {activeDashboard && (
        <>
          {/* Active Dashboard Configuration Bar */}
          <div style={styles.configBar}>
            <div style={styles.configGroup}>
              <label style={styles.label}>Add Saved Chart:</label>
              <select
                style={styles.select}
                value={selectedChartId}
                onChange={(e) => setSelectedChartId(e.target.value)}
              >
                <option value="">-- Choose a Saved Chart --</option>
                {savedCharts.map((chart) => (
                  <option key={chart._id || chart.id} value={chart._id || chart.id}>
                    {chart.title} ({chart.chartType})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddChartToDashboard}
                disabled={!selectedChartId}
                style={{
                  ...styles.btnSecondary,
                  opacity: selectedChartId ? 1 : 0.6,
                }}
              >
                Add Chart
              </button>
            </div>

            <div style={styles.configGroup}>
              <label style={styles.label}>Grid Columns:</label>
              <select
                style={styles.selectSmall}
                value={columns}
                onChange={async (e) => {
                  const newCols = Number(e.target.value);
                  setColumns(newCols);
                  if (activeDashboard) {
                    await updateDashboard(activeDashboard._id, {
                      layoutConfig: { columns: newCols },
                    });
                  }
                }}
              >
                <option value={1}>1 Column</option>
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
              </select>

              <button onClick={handleDeleteDashboard} style={styles.btnDanger}>
                Delete Dashboard
              </button>
            </div>
          </div>

          {/* Grid Canvas Render */}
          <DashboardGridCanvas
            dashboard={{ ...activeDashboard, layoutConfig: { columns } }}
            onRemoveChart={handleRemoveChartFromDashboard}
          />
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    marginTop: '24px',
  },
  topBar: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#0f172a',
  },
  alert: {
    fontSize: '13px',
    color: '#2563eb',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    padding: '6px 12px',
    borderRadius: '6px',
  },
  panel: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
  },
  panelSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: '280px',
  },
  configBar: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  configGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#475569',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  selectSmall: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    flex: 1,
  },
  btnPrimary: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#059669',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDanger: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
};

export default DashboardBuilder;