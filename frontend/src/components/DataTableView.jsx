import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { deleteDataset } from "../redux/slices/datasetSlice";

// Helper function to format cell values & convert Excel Serial Dates (e.g., 46175 -> "2026-06-01")
const formatCellValue = (val) => {
  if (val === undefined || val === null || val === '') return null;

  // Check for Excel date serial range (roughly covering 1995 to 2064)
  if (typeof val === 'number' && val >= 35000 && val <= 60000) {
    const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split('T')[0];
    }
  }

  // Handle strings containing pure Excel serial date numbers
  if (typeof val === 'string' && /^\d{5}$/.test(val.trim())) {
    const num = Number(val);
    if (num >= 35000 && num <= 60000) {
      const dateObj = new Date(Math.round((num - 25569) * 86400 * 1000));
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0];
      }
    }
  }

  return String(val);
};

const DataTableView = ({ dataset, rows = [] }) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const rowsPerPage = 10;

  if (!dataset) return null;

  const rawColumns = dataset.columns || [];
  // Normalize columns (handles both string arrays and object schema arrays)
  const columns = rawColumns.map((col) => {
    if (typeof col === 'object' && col !== null) {
      return { name: col.name || col.key, dataType: col.dataType || 'attribute' };
    }
    return { name: String(col), dataType: 'attribute' };
  });

  const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;

  // Reset page if rows count changes (e.g., filtering or dataset switch)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [rows.length, totalPages, currentPage]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  const handleDelete = async () => {
    const datasetId = dataset._id || dataset.id;
    if (!datasetId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${dataset.originalName || dataset.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      setIsDeleting(true);
      try {
        await dispatch(deleteDataset(datasetId)).unwrap();
      } catch (err) {
        alert(`Delete failed: ${err}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Data Preview — {dataset.originalName || dataset.name}</h3>
          <p style={styles.meta}>
            Showing {rows.length} rows | {columns.length} columns | Quality Score: <strong>{dataset.qualityScore ?? 100}%</strong>
          </p>
        </div>
        <div style={styles.actionGroup}>
          {dataset.fileType && (
            <span style={styles.badge}>{dataset.fileType.toUpperCase()}</span>
          )}
          <button 
            onClick={handleDelete} 
            disabled={isDeleting} 
            style={{
              ...styles.deleteBtn,
              opacity: isDeleting ? 0.6 : 1,
              cursor: isDeleting ? 'not-allowed' : 'pointer'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Dataset'}
          </button>
        </div>
      </div>

      {/* Column Schema Badges */}
      {columns.length > 0 && (
        <div style={styles.schemaContainer}>
          <span style={styles.schemaLabel}>Columns:</span>
          {columns.map((col, idx) => (
            <span key={idx} style={styles.colTag}>
              {col.name} <small style={styles.colType}>({col.dataType})</small>
            </span>
          ))}
        </div>
      )}

      {/* Data Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              {columns.map((col, idx) => (
                <th key={idx} style={styles.th}>
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((row, rIdx) => (
                <tr key={row._id || row.id || rIdx} style={rIdx % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.tdMeta}>{indexOfFirstRow + rIdx + 1}</td>
                  {columns.map((col, cIdx) => {
                    const rawVal = row[col.name];
                    const formattedVal = formatCellValue(rawVal);
                    return (
                      <td key={cIdx} style={styles.td}>
                        {formattedVal !== null ? (
                          formattedVal
                        ) : (
                          <span style={styles.nullText}>null</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} style={styles.emptyTd}>
                  No rows available in this dataset.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {rows.length > 0 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{
              ...styles.pageBtn,
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              ...styles.pageBtn,
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  title: { margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' },
  meta: { margin: 0, fontSize: '13px', color: '#64748b' },
  actionGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  badge: { padding: '4px 8px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  deleteBtn: { padding: '6px 12px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', transition: 'opacity 0.2s' },
  schemaContainer: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' },
  schemaLabel: { fontSize: '12px', fontWeight: 'bold', color: '#475569' },
  colTag: { padding: '3px 8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', color: '#334155' },
  colType: { color: '#3b82f6', fontWeight: '600' },
  tableWrapper: { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' },
  th: { backgroundColor: '#0f172a', color: '#ffffff', padding: '10px 12px', fontWeight: '600', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', color: '#334155', whiteSpace: 'nowrap' },
  tdMeta: { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontWeight: 'bold', width: '40px' },
  trEven: { backgroundColor: '#ffffff' },
  trOdd: { backgroundColor: '#f8fafc' },
  nullText: { color: '#ef4444', fontStyle: 'italic', fontSize: '11px' },
  emptyTd: { textAlign: 'center', padding: '20px', color: '#94a3b8' },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' },
  pageBtn: { padding: '6px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' },
  pageInfo: { fontSize: '13px', color: '#64748b' },
};

export default DataTableView;