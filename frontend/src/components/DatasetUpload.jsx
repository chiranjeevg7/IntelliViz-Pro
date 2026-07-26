import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDatasetFile } from '../redux/slices/datasetSlice';

const MAX_FILE_SIZE_MB = 25;
const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

const DatasetUpload = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [clientError, setClientError] = useState('');
  
  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector((state) => state.dataset);

  // Client-Side Security & Format Check
  const validateSelectedFile = (selectedFile) => {
    setClientError('');
    if (!selectedFile) return false;

    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setClientError(`Invalid file format "${ext}". Only CSV, XLSX, and XLS files are allowed.`);
      setFile(null);
      return false;
    }

    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setClientError(`File size (${fileSizeMB.toFixed(2)} MB) exceeds the max allowed limit of ${MAX_FILE_SIZE_MB} MB.`);
      setFile(null);
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    dispatch(uploadDatasetFile(formData)).then((res) => {
      if (!res.error) {
        setFile(null);
        setClientError('');
      }
    });
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setClientError('');
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>📁 Upload Dataset</h3>
      <p style={styles.subtitle}>
        Upload CSV or Excel files (.csv, .xlsx, .xls) up to 25MB
      </p>

      {/* Security & Error Alerts */}
      {(clientError || isError) && (
        <div style={styles.errorAlert}>
          {clientError || message}
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            ...styles.dropZone,
            borderColor: isDragging ? '#2563eb' : '#cbd5e1',
            backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
          }}
        >
          <div style={styles.icon}>📤</div>
          {file ? (
            <div style={styles.fileSelectedBox}>
              <p style={styles.selectedFileName}>
                Selected File: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              <button type="button" onClick={handleRemoveFile} style={styles.removeBtn}>
                ✖ Remove File
              </button>
            </div>
          ) : (
            <p style={styles.dropText}>
              Drag and drop your dataset here, or{' '}
              <label htmlFor="fileInput" style={styles.browseLabel}>
                browse
              </label>
            </p>
          )}
          <input
            id="fileInput"
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <button
          type="submit"
          disabled={!file || isLoading}
          style={{
            ...styles.uploadBtn,
            backgroundColor: !file || isLoading ? '#94a3b8' : '#2563eb',
            cursor: !file || isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Processing & Validating Dataset...' : 'Upload & Process Dataset'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
  cardTitle: { margin: '0 0 6px 0', fontSize: '18px', color: '#0f172a' },
  subtitle: { margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' },
  dropZone: { border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '32px', textAlign: 'center', transition: 'all 0.2s ease', cursor: 'pointer' },
  icon: { fontSize: '32px', marginBottom: '8px' },
  dropText: { fontSize: '14px', color: '#475569', margin: 0 },
  browseLabel: { color: '#2563eb', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' },
  fileSelectedBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  selectedFileName: { fontSize: '14px', color: '#0f172a', margin: 0 },
  removeBtn: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' },
  uploadBtn: { width: '100%', marginTop: '16px', padding: '12px', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600' },
  errorAlert: { padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' },
};

export default DatasetUpload;