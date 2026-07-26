import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import API from '../services/api';

const COLOR_PALETTE = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'
];

// Comprehensive Universal Date & Value Formatter
const formatUniversalValue = (val) => {
  if (val === null || val === undefined || val === '') return 'N/A';

  // Parse Excel Serial Numbers (e.g. 46175 -> "2026-06-01")
  const numVal = Number(val);
  if (!isNaN(numVal) && numVal >= 35000 && numVal <= 60000) {
    const d = new Date(Math.round((numVal - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  // Parse standard Date Strings / Timestamps
  if (typeof val === 'string' && (val.includes('-') || val.includes('/')) && !isNaN(Date.parse(val))) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  return val;
};

const AnalyticsStudio = ({ dataset, rows = [] }) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxisKey, setXAxisKey] = useState('');
  const [yAxisKey, setYAxisKey] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const chartRef = useRef(null);

  // Extract clean list of column names
  const columns = useMemo(() => {
    if (Array.isArray(dataset?.columns)) {
      return dataset.columns.map((c) => (typeof c === 'object' ? c.name || c.key : c));
    }
    if (rows && rows.length > 0) return Object.keys(rows[0]);
    return [];
  }, [dataset, rows]);

  // Set default axes on load
  useEffect(() => {
    if (columns.length > 0) {
      if (!xAxisKey || !columns.includes(xAxisKey)) setXAxisKey(columns[0]);
      if (!yAxisKey || !columns.includes(yAxisKey)) setYAxisKey(columns[1] || columns[0]);
    }
  }, [columns, xAxisKey, yAxisKey]);

  // Formatted & Auto-Aggregated Chart Dataset
  const processedData = useMemo(() => {
    if (!rows || rows.length === 0 || !xAxisKey || !yAxisKey) return [];

    const map = new Map();
    rows.forEach((r) => {
      const rawX = r[xAxisKey];
      const rawY = Number(r[yAxisKey]);

      const formattedX = String(formatUniversalValue(rawX));
      const validY = isNaN(rawY) ? 0 : rawY;

      if (map.has(formattedX)) {
        map.set(formattedX, map.get(formattedX) + validY);
      } else {
        map.set(formattedX, validY);
      }
    });

    const result = [];
    map.forEach((value, key) => {
      result.push({
        [xAxisKey]: key,
        [yAxisKey]: Number(value.toFixed(2)),
      });
    });

    return result.slice(0, 35); // Keep charts clean & responsive
  }, [rows, xAxisKey, yAxisKey]);

  // Statistical Computations for Special Chart Types
  const histogramData = useMemo(() => {
    const vals = rows.map((r) => Number(r[yAxisKey])).filter((v) => !isNaN(v));
    if (vals.length === 0) return [];

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binCount = 5;
    const step = (max - min) / binCount || 1;
    const bins = new Array(binCount).fill(0);

    vals.forEach((v) => {
      const idx = Math.min(Math.floor((v - min) / step), binCount - 1);
      bins[idx]++;
    });

    return bins.map((count, i) => ({
      range: `${(min + i * step).toFixed(0)} - ${(min + (i + 1) * step).toFixed(0)}`,
      Frequency: count,
    }));
  }, [rows, yAxisKey]);

  const boxPlotData = useMemo(() => {
    const sorted = rows.map((r) => Number(r[yAxisKey])).filter((v) => !isNaN(v)).sort((a, b) => a - b);
    if (sorted.length === 0) return [];

    return [
      { Metric: 'Min', Value: sorted[0] },
      { Metric: 'Q1 (25%)', Value: sorted[Math.floor(sorted.length * 0.25)] },
      { Metric: 'Median', Value: sorted[Math.floor(sorted.length * 0.5)] },
      { Metric: 'Q3 (75%)', Value: sorted[Math.floor(sorted.length * 0.75)] },
      { Metric: 'Max', Value: sorted[sorted.length - 1] },
    ];
  }, [rows, yAxisKey]);

  // Automated Real-Time Insight Generator Panel
  const dynamicInsights = useMemo(() => {
    if (!rows || rows.length === 0 || !yAxisKey) return [];

    const vals = rows.map((r) => Number(r[yAxisKey])).filter((v) => !isNaN(v));
    if (vals.length === 0) {
      return [{ tag: 'NOTICE', text: `Select a numeric column for Y-Axis to calculate summary statistics.` }];
    }

    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = (sum / vals.length).toFixed(2);
    const max = Math.max(...vals);
    const min = Math.min(...vals);

    return [
      { tag: 'AVERAGE', text: `Mean value for ${yAxisKey} is ${Number(mean).toLocaleString()}.` },
      { tag: 'PEAK', text: `Maximum observed value is ${max.toLocaleString()}, minimum is ${min.toLocaleString()}.` },
      { tag: 'SPREAD', text: `Total numeric variance span across ${vals.length} evaluated records is ${(max - min).toLocaleString()}.` },
    ];
  }, [rows, yAxisKey]);

  // Save Chart Image directly to backend gallery
  const handleSaveChart = async () => {
    try {
      setStatusMsg('Saving chart...');
      let imgData = '';
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        imgData = canvas.toDataURL('image/png');
      }

      await API.post('/saved-items/charts', {
        datasetId: dataset?._id || dataset?.id,
        title: `${chartType.toUpperCase()} — ${xAxisKey} vs ${yAxisKey}`,
        chartType,
        xAxis: xAxisKey,
        yAxis: yAxisKey,
        chartImage: imgData,
      });

      setStatusMsg('✅ Saved to Gallery!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusMsg('❌ Save failed.');
    }
  };

  // Export Chart Image locally
  const handleExportPNG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${dataset?.originalName || dataset?.name || 'Analytics_Chart'}.png`;
    link.click();
  };

  // Maximum value for heatmap opacity calculation
  const maxHeatVal = useMemo(() => {
    return Math.max(...processedData.map((d) => Number(d[yAxisKey]) || 0), 1);
  }, [processedData, yAxisKey]);

  return (
    <div style={styles.container}>
      {/* Studio Header & Controls */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>📈 Advanced Analytics Studio</h3>
            <p style={styles.subtitle}>Interactive Data Visualization & Statistical Modeling Engine</p>
          </div>

          <div style={styles.controls}>
            <div style={styles.controlGroup}>
              <label style={styles.label}>Chart Type:</label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)} style={styles.select}>
                <option value="bar">📊 Column Bar Chart</option>
                <option value="line">📈 Line Trend Chart</option>
                <option value="area">📉 Area Fill Chart</option>
                <option value="pie">🍩 Donut / Pie Chart</option>
                <option value="composed">🔀 Composed (Bar + Line)</option>
                <option value="scatter">🔵 Scatter Distribution</option>
                <option value="radar">🕸️ Radar Performance Matrix</option>
                <option value="histogram">📊 Frequency Histogram</option>
                <option value="boxplot">📦 Box Plot Breakdown</option>
                <option value="funnel">🔻 Horizontal Funnel</option>
                <option value="heatmap">🌡️ Heatmap Grid</option>
              </select>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label}>X-Axis (Dimension):</label>
              <select value={xAxisKey} onChange={(e) => setXAxisKey(e.target.value)} style={styles.select}>
                {columns.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label}>Y-Axis (Metric):</label>
              <select value={yAxisKey} onChange={(e) => setYAxisKey(e.target.value)} style={styles.select}>
                {columns.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button onClick={handleSaveChart} style={styles.saveBtn}>💾 Save to Gallery</button>
            <button onClick={handleExportPNG} style={styles.exportBtn}>🖼️ Export PNG</button>
          </div>
        </div>

        {statusMsg && <p style={styles.status}>{statusMsg}</p>}

        {/* Visual Chart Viewport */}
        <div ref={chartRef} style={styles.chartViewport}>
          <ResponsiveContainer width="100%" height={360}>
            {chartType === 'bar' ? (
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey={xAxisKey} angle={-25} textAnchor="end" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString(), yAxisKey]} />
                <Legend verticalAlign="top" />
                <Bar dataKey={yAxisKey} fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey={xAxisKey} angle={-25} textAnchor="end" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString(), yAxisKey]} />
                <Legend verticalAlign="top" />
                <Line type="monotone" dataKey={yAxisKey} stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey={xAxisKey} angle={-25} textAnchor="end" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString(), yAxisKey]} />
                <Area type="monotone" dataKey={yAxisKey} stroke="#2563eb" fill="#93c5fd" fillOpacity={0.6} />
              </AreaChart>
            ) : chartType === 'pie' ? (
              <PieChart>
                <Tooltip formatter={(value) => [Number(value).toLocaleString(), yAxisKey]} />
                <Legend />
                <Pie
                  data={processedData.slice(0, 10)}
                  dataKey={yAxisKey}
                  nameKey={xAxisKey}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={95}
                  paddingAngle={3}
                  label
                >
                  {processedData.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={COLOR_PALETTE[i % COLOR_PALETTE.length]} />
                  ))}
                </Pie>
              </PieChart>
            ) : chartType === 'composed' ? (
              <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey={xAxisKey} angle={-25} textAnchor="end" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString(), yAxisKey]} />
                <Legend verticalAlign="top" />
                <Bar dataKey={yAxisKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey={yAxisKey} stroke="#ef4444" strokeWidth={2} />
              </ComposedChart>
            ) : chartType === 'scatter' ? (
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey={xAxisKey} name={xAxisKey} tick={{ fontSize: 12 }} />
                <YAxis dataKey={yAxisKey} name={yAxisKey} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Data Points" data={processedData} fill="#2563eb" />
              </ScatterChart>
            ) : chartType === 'radar' ? (
              <RadarChart cx="50%" cy="50%" outerRadius={95} data={processedData.slice(0, 8)}>
                <PolarGrid />
                <PolarAngleAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} />
                <PolarRadiusAxis />
                <Radar name={yAxisKey} dataKey={yAxisKey} stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            ) : chartType === 'histogram' ? (
              <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="Frequency" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : chartType === 'boxplot' ? (
              <BarChart data={boxPlotData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="Metric" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => [Number(val).toLocaleString(), 'Value']} />
                <Bar dataKey="Value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : chartType === 'funnel' ? (
              <BarChart layout="vertical" data={processedData.slice(0, 8)} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey={xAxisKey} type="category" tick={{ fontSize: 12 }} width={90} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString(), yAxisKey]} />
                <Bar dataKey={yAxisKey} fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            ) : (
              /* Heatmap Grid */
              <div style={styles.heatGrid}>
                {processedData.slice(0, 16).map((item, idx) => {
                  const rawVal = Number(item[yAxisKey]) || 0;
                  const opacity = Math.max(0.15, Math.min(1, rawVal / maxHeatVal));
                  return (
                    <div
                      key={idx}
                      style={{
                        ...styles.heatTile,
                        backgroundColor: `rgba(37, 99, 235, ${opacity})`,
                        color: opacity > 0.5 ? '#ffffff' : '#0f172a',
                      }}
                    >
                      <span style={styles.heatLabel}>{item[xAxisKey]}</span>
                      <strong style={styles.heatVal}>{rawVal.toLocaleString()}</strong>
                    </div>
                  );
                })}
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dynamic AI Insights & Anomaly Flags Panel */}
      <div style={styles.card}>
        <h3 style={styles.title}>🤖 Dynamic Data Insights & Key Statistics</h3>
        <div style={styles.insightsList}>
          {dynamicInsights.map((item, index) => (
            <div key={index} style={styles.insightRow}>
              <span style={styles.badge}>{item.tag}</span>
              <p style={styles.insightText}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' },
  title: { margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' },
  subtitle: { margin: 0, fontSize: '13px', color: '#64748b' },
  controls: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' },
  controlGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#475569' },
  select: { padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', background: '#f8fafc' },
  saveBtn: { padding: '8px 14px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  exportBtn: { padding: '8px 14px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  status: { color: '#059669', fontWeight: 'bold', fontSize: '12px', marginBottom: '12px' },
  chartViewport: { width: '100%', marginTop: '12px' },
  heatGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', padding: '10px 0' },
  heatTile: { padding: '16px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' },
  heatLabel: { fontSize: '11px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
  heatVal: { fontSize: '15px' },
  insightsList: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' },
  insightRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', background: '#f8fafc' },
  badge: { padding: '4px 8px', borderRadius: '4px', backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '11px', fontWeight: 'bold' },
  insightText: { margin: 0, fontSize: '13px', color: '#334155' },
};

export default AnalyticsStudio;