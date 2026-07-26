import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDatasets, setActiveDataset } from '../redux/slices/datasetSlice';
import DatasetUpload from '../components/DatasetUpload';
import DataTableView from '../components/DataTableView';
import DataCleaner from '../components/DataCleaner';
import AnalyticsStudio from '../components/AnalyticsStudio';
import ReportManager from '../components/ReportManager';
import SmartInsights from '../components/SmartInsights';
import SavedItemsGallery from '../components/SavedItemsGallery';
import ProfileAndSettings from '../components/ProfileAndSettings';
import API from '../services/api';

const Dashboard = ({ initialTab = 'data' }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth || {});
  const { datasets, activeDataset, isLoading } = useSelector((state) => state.dataset);
  
  const [activeRows, setActiveRows] = useState([]);
  const [isRowsLoading, setIsRowsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab); // 'data' | 'analytics' | 'reports' | 'saved' | 'settings'
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('intelliviz_theme') || 'light';
  });

  // Extract selected dataset ID
  const selectedDatasetId = activeDataset?._id || activeDataset?.id || '';

  // Fetch user datasets on mount
  useEffect(() => {
    dispatch(fetchUserDatasets());
  }, [dispatch]);

  // Synchronize activeTab with URL path when Navbar links or profile icon are clicked
  useEffect(() => {
    if (location.pathname === '/visualize') {
      setActiveTab('analytics');
    } else if (location.pathname === '/reports') {
      setActiveTab('reports');
    } else if (location.pathname === '/saved-items') {
      setActiveTab('saved');
    } else if (location.pathname === '/settings' || location.pathname === '/profile') {
      setActiveTab('settings');
    } else if (location.pathname === '/dashboard') {
      setActiveTab('data');
    }
  }, [location.pathname]);

  // Auto-select first dataset if none is currently active
  useEffect(() => {
    if (datasets && datasets.length > 0 && !activeDataset) {
      dispatch(setActiveDataset(datasets[0]));
    }
  }, [datasets, activeDataset, dispatch]);

  // Fetch rows whenever activeDataset changes
  useEffect(() => {
    let isMounted = true;

    if (selectedDatasetId) {
      setIsRowsLoading(true);
      API.get(`/datasets/${selectedDatasetId}`)
        .then((res) => {
          if (!isMounted) return;
          const body = res.data;

          let rows = [];
          if (Array.isArray(body)) {
            rows = body;
          } else if (Array.isArray(body?.rows)) {
            rows = body.rows;
          } else if (Array.isArray(body?.data)) {
            rows = body.data;
          } else if (Array.isArray(body?.data?.rows)) {
            rows = body.data.rows;
          } else if (Array.isArray(body?.dataset?.rows)) {
            rows = body.dataset.rows;
          } else if (Array.isArray(body?.dataset?.data)) {
            rows = body.dataset.data;
          }

          setActiveRows(rows);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('Fetch dataset rows error:', err);
          setActiveRows([]);
        })
        .finally(() => {
          if (isMounted) setIsRowsLoading(false);
        });
    } else {
      setActiveRows([]);
    }

    return () => {
      isMounted = false;
    };
  }, [activeDataset, selectedDatasetId]);

  const handleSelectDataset = (ds) => {
    dispatch(setActiveDataset(ds));
  };

  const handleDataCleaned = (updatedDataset) => {
    if (updatedDataset) {
      dispatch(setActiveDataset(updatedDataset));
    }
    dispatch(fetchUserDatasets());
  };

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('intelliviz_theme', newTheme);
  };

  return (
    <div style={styles.container}>
      {activeTab === 'settings' ? (
        <ProfileAndSettings
          user={user}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      ) : (
        <>
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>📊 Workspace Dashboard</h2>
              <p style={styles.subtitle}>Upload, inspect, clean, visualize, and generate reports for your datasets</p>
            </div>

            {/* Dataset Switcher Dropdown */}
            {datasets && datasets.length > 0 && (
              <div style={styles.switcher}>
                <label style={styles.switcherLabel}>Active Dataset:</label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => {
                    const found = datasets.find((d) => (d._id || d.id) === e.target.value);
                    if (found) handleSelectDataset(found);
                  }}
                  style={styles.select}
                >
                  {datasets.map((d) => {
                    const id = d._id || d.id;
                    return (
                      <option key={id} value={id}>
                        {d.originalName || d.name || 'Dataset'} ({d.rowCount || d.rowsCount || (d.data ? d.data.length : 0)} rows)
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Upload Component (Visible on data workbench) */}
          {activeTab === 'data' && <DatasetUpload />}

          {/* Workspace Navigation Tabs */}
          <div style={styles.tabContainer}>
            <button
              onClick={() => setActiveTab('data')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'data' ? styles.activeTabButton : {}),
              }}
            >
              🔍 Data Inspection & Cleaning
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'analytics' ? styles.activeTabButton : {}),
              }}
            >
              📈 Analytics & AI Studio
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'reports' ? styles.activeTabButton : {}),
              }}
            >
              📄 Executive Reports
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'saved' ? styles.activeTabButton : {}),
              }}
            >
              💾 Saved Items & Gallery
            </button>
          </div>

          {/* Tab Views */}
          {isLoading ? (
            <div style={styles.loadingBox}>Loading workspace datasets...</div>
          ) : activeDataset ? (
            <>
              {activeTab === 'data' && (
                <>
                  {selectedDatasetId && <SmartInsights datasetId={selectedDatasetId} />}
                  <DataCleaner dataset={activeDataset} onDataCleaned={handleDataCleaned} />
                  {isRowsLoading ? (
                    <div style={styles.loadingBox}>Fetching table data...</div>
                  ) : (
                    <DataTableView dataset={activeDataset} rows={activeRows} />
                  )}
                </>
              )}

              {activeTab === 'analytics' && (
                <AnalyticsStudio dataset={activeDataset} rows={activeRows} />
              )}

              {activeTab === 'reports' && (
                <ReportManager dataset={activeDataset} />
              )}

              {activeTab === 'saved' && (
                <SavedItemsGallery />
              )}
            </>
          ) : (
            <div style={styles.emptyState}>
              <p>No dataset selected. Upload a file above to start your analysis.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { margin: '0 0 4px 0', fontSize: '24px', color: '#0f172a' },
  subtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
  switcher: { display: 'flex', alignItems: 'center', gap: '10px' },
  switcherLabel: { fontSize: '13px', fontWeight: 'bold', color: '#475569' },
  select: { padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', cursor: 'pointer' },
  loadingBox: { padding: '40px', textAlign: 'center', color: '#64748b' },
  emptyState: { padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', color: '#64748b', marginTop: '24px' },
  tabContainer: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' },
  tabButton: { padding: '10px 18px', border: 'none', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  activeTabButton: { background: '#2563eb', color: '#ffffff' },
};

export default Dashboard;