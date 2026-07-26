import React, { useState } from 'react';
import API from '../services/api';

const DataCleaner = ({ dataset, onDataCleaned, onResetDataset }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [imputeStrategy, setImputeStrategy] = useState('mean');

  const [colToRename, setColToRename] = useState('');
  const [newColName, setNewColName] = useState('');
  const [colToDelete, setColToDelete] = useState('');

  const [statusMsg, setStatusMsg] = useState({ text: '', isError: false });

  if (!dataset) {
    return (
      <div style={styles.card}>
        <p style={styles.emptyText}>No dataset selected for cleaning.</p>
      </div>
    );
  }

  // Safely extract raw column string names
  const rawColumns = dataset?.columns || [];
  const columns = Array.isArray(rawColumns)
    ? rawColumns.map((c) => (typeof c === 'object' ? c.name || c.key || c.accessor || Object.keys(c)[0] : c))
    : dataset?.data && dataset.data[0]
    ? Object.keys(dataset.data[0])
    : [];

  const rowCount = dataset?.rowCount || dataset?.rowsCount || (Array.isArray(dataset?.data) ? dataset.data.length : 0);

  // Helper to re-map local state preview
  const applyCleanResultToParent = (apiResponseData) => {
    if (!onDataCleaned) return;

    // Extracted updated metadata and preview rows from backend response
    const updatedDatasetObj = apiResponseData.dataset || apiResponseData;
    const previewRows = apiResponseData.previewRows || apiResponseData.rows || updatedDatasetObj.data;

    const updatedDataset = {
      ...updatedDatasetObj,
      data: previewRows || dataset.data,
      previewRows: previewRows || dataset.previewRows,
    };

    onDataCleaned(updatedDataset);
  };

  // 1. Deduplication
  const handleRemoveDuplicates = async () => {
    try {
      setIsProcessing(true);
      setStatusMsg({ text: '', isError: false });

      const res = await API.post(`/datasets/${dataset._id || dataset.id}/clean`, {
        action: 'remove_duplicates',
      });

      setStatusMsg({ text: `🎉 ${res.data?.message || 'Dataset deduplicated successfully.'}`, isError: false });
      if (res.data?.data) applyCleanResultToParent(res.data.data);
    } catch (err) {
      setStatusMsg({ text: err.response?.data?.error || 'Error removing duplicates.', isError: true });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Imputation / Fill Missing
  const handleImpute = async () => {
    if (!selectedColumn) return setStatusMsg({ text: 'Select a column to impute.', isError: true });

    try {
      setIsProcessing(true);
      setStatusMsg({ text: '', isError: false });

      const res = await API.post(`/datasets/${dataset._id || dataset.id}/clean`, {
        action: 'fill_missing',
        columnName: selectedColumn,
        fillStrategy: imputeStrategy,
      });

      setStatusMsg({ text: `✅ ${res.data?.message || 'Missing values filled.'}`, isError: false });
      if (res.data?.data) applyCleanResultToParent(res.data.data);
    } catch (err) {
      setStatusMsg({ text: err.response?.data?.error || 'Error during imputation.', isError: true });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Rename Column (Aligned with Backend: columnName & newName)
  const handleRenameColumn = async () => {
    if (!colToRename || !newColName.trim()) {
      setStatusMsg({ text: 'Select target column and enter a new name.', isError: true });
      return;
    }

    const cleanNew = newColName.trim();
    setIsProcessing(true);
    setStatusMsg({ text: '', isError: false });

    try {
      const res = await API.post(`/datasets/${dataset._id || dataset.id}/clean`, {
        action: 'rename_column',
        columnName: colToRename, // 👈 Strict key match for datasetController
        newName: cleanNew,       // 👈 Strict key match for datasetController
      });

      setStatusMsg({ text: `✏️ Renamed "${colToRename}" to "${cleanNew}".`, isError: false });
      setColToRename('');
      setNewColName('');

      if (res.data?.data) {
        applyCleanResultToParent(res.data.data);
      }
    } catch (err) {
      console.error('Rename Error:', err.response?.data || err.message);
      setStatusMsg({ text: err.response?.data?.error || 'Failed to rename column.', isError: true });
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Delete Column (Aligned with Backend: columnName)
  const handleDeleteColumn = async () => {
    if (!colToDelete) {
      setStatusMsg({ text: 'Select a column to delete.', isError: true });
      return;
    }

    setIsProcessing(true);
    setStatusMsg({ text: '', isError: false });

    try {
      const res = await API.post(`/datasets/${dataset._id || dataset.id}/clean`, {
        action: 'delete_column',
        columnName: colToDelete, // 👈 Strict key match for datasetController
      });

      setStatusMsg({ text: `🗑️ Deleted column "${colToDelete}".`, isError: false });
      setColToDelete('');

      if (res.data?.data) {
        applyCleanResultToParent(res.data.data);
      }
    } catch (err) {
      console.error('Delete Error:', err.response?.data || err.message);
      setStatusMsg({ text: err.response?.data?.error || 'Failed to delete column.', isError: true });
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Export CSV
  const handleExportCSV = () => {
    const dataRows = dataset.previewRows || dataset.rows || dataset.data || [];
    if (!dataRows || dataRows.length === 0) return;

    const headers = columns.join(',');
    const csvRows = dataRows.map((row) =>
      columns.map((col) => `"${('' + (row[col] ?? '')).replace(/"/g, '""')}"`).join(',')
    );

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + [headers, ...csvRows].join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${dataset.originalName || 'cleaned_dataset'}_processed.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>🧹 Data Inspection & Cleaning</h3>
          <p style={styles.subtitle}>
            Active Dataset: <strong>{dataset.originalName || dataset.name || 'Dataset'}</strong> ({rowCount} rows, {columns.length} columns)
          </p>
        </div>
        <div style={styles.btnGroup}>
          <button onClick={handleExportCSV} style={styles.exportBtn}>📥 Export Cleaned CSV</button>
          {onResetDataset && <button onClick={onResetDataset} style={styles.resetBtn}>🔄 Reset Raw</button>}
        </div>
      </div>

      {statusMsg.text && (
        <div style={statusMsg.isError ? styles.errorBox : styles.successBox}>{statusMsg.text}</div>
      )}

      {/* Deduplication */}
      <div style={styles.actionBox}>
        <div style={styles.actionHeader}>
          <h4 style={styles.actionTitle}>1. Deduplication</h4>
          <button onClick={handleRemoveDuplicates} disabled={isProcessing} style={styles.actionBtn}>
            {isProcessing ? 'Processing...' : '✨ Auto-Deduplicate'}
          </button>
        </div>
        <p style={styles.actionDesc}>Purges exact duplicate records matching across all fields.</p>
      </div>

      {/* Fill Missing / Imputation */}
      <div style={styles.actionBox}>
        <h4 style={styles.actionTitle}>2. Impute / Fill Missing Values</h4>
        <div style={styles.controlGroup}>
          <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={styles.select}>
            <option value="">Select Column...</option>
            {columns.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          <select value={imputeStrategy} onChange={(e) => setImputeStrategy(e.target.value)} style={styles.select}>
            <option value="mean">Strategy: Mean</option>
            <option value="median">Strategy: Median</option>
            <option value="mode">Strategy: Mode</option>
            <option value="drop">Strategy: Drop Row</option>
          </select>
          <button onClick={handleImpute} disabled={isProcessing || !selectedColumn} style={styles.actionBtn}>Apply Strategy</button>
        </div>
      </div>

      {/* Rename Column */}
      <div style={styles.actionBox}>
        <h4 style={styles.actionTitle}>3. Rename Column</h4>
        <div style={styles.controlGroup}>
          <select value={colToRename} onChange={(e) => setColToRename(e.target.value)} style={styles.select}>
            <option value="">Select Target Column...</option>
            {columns.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            placeholder="New Column Name..."
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleRenameColumn} disabled={isProcessing || !colToRename || !newColName} style={styles.actionBtn}>
            Rename Column
          </button>
        </div>
      </div>

      {/* Delete Column */}
      <div style={styles.actionBox}>
        <h4 style={styles.actionTitle}>4. Delete Column</h4>
        <div style={styles.controlGroup}>
          <select value={colToDelete} onChange={(e) => setColToDelete(e.target.value)} style={styles.select}>
            <option value="">Select Column to Delete...</option>
            {columns.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          <button onClick={handleDeleteColumn} disabled={isProcessing || !colToDelete} style={{ ...styles.actionBtn, backgroundColor: '#dc2626' }}>
            🗑️ Delete Column
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' },
  title: { margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' },
  subtitle: { margin: 0, fontSize: '13px', color: '#64748b' },
  btnGroup: { display: 'flex', gap: '10px' },
  exportBtn: { padding: '8px 16px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  resetBtn: { padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  successBox: { padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' },
  errorBox: { padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' },
  actionBox: { padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px' },
  actionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  actionTitle: { margin: '0 0 6px 0', fontSize: '15px', color: '#1e293b' },
  actionDesc: { margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' },
  actionBtn: { padding: '8px 14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  controlGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' },
  input: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', minWidth: '180px' },
  emptyText: { color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' },
};

export default DataCleaner;