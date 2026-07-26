import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const PlotlyVisualizer = ({ datasetData, columns, numericColumns, categoricalColumns, onSaveChart }) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState(categoricalColumns[0] || columns[0] || '');
  const [yAxis, setYAxis] = useState(numericColumns[0] || columns[1] || '');
  const [chartTitle, setChartTitle] = useState('Custom Chart');

  if (!datasetData || datasetData.length === 0) {
    return (
      <div style={styles.placeholder}>
        <p>No dataset loaded for visualization.</p>
      </div>
    );
  }

  // Extract values for selected axes
  const xValues = datasetData.map((row) => row[xAxis]);
  const yValues = datasetData.map((row) => row[yAxis]);

  // Construct Plotly Data Trace
  const getPlotTraces = () => {
    switch (chartType) {
      case 'pie':
        return [
          {
            labels: xValues,
            values: yValues,
            type: 'pie',
            hoverinfo: 'label+percent+value',
            textinfo: 'percent',
          },
        ];

      case 'histogram':
        return [
          {
            x: yValues,
            type: 'histogram',
            marker: { color: '#3b82f6' },
          },
        ];

      case 'box':
        return [
          {
            y: yValues,
            type: 'box',
            name: yAxis,
            boxpoints: 'outliers',
            marker: { color: '#8b5cf6' },
          },
        ];

      case 'heatmap':
        // Generate correlation/matrix-style mock intensity
        return [
          {
            z: [yValues.slice(0, 10), xValues.slice(0, 10).map((v) => Number(v) || 0)],
            type: 'heatmap',
            colorscale: 'Viridis',
          },
        ];

      case 'area':
        return [
          {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines',
            fill: 'tozeroy',
            line: { color: '#10b981' },
          },
        ];

      case 'scatter':
        return [
          {
            x: xValues,
            y: yValues,
            mode: 'markers',
            type: 'scatter',
            marker: { color: '#ec4899', size: 8 },
          },
        ];

      case 'line':
        return [
          {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#06b6d4' },
          },
        ];

      case 'bar':
      default:
        return [
          {
            x: xValues,
            y: yValues,
            type: 'bar',
            marker: { color: '#3b82f6' },
          },
        ];
    }
  };

  const handleSave = () => {
    if (onSaveChart) {
      onSaveChart({
        title: chartTitle,
        chartType,
        xAxisKey: xAxis,
        yAxisKey: yAxis,
      });
    }
  };

  return (
    <div style={styles.container}>
      {/* Controls Bar */}
      <div style={styles.controlBar}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>Chart Title:</label>
          <input
            type="text"
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>Type:</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            style={styles.select}
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="scatter">Scatter Plot</option>
            <option value="histogram">Histogram</option>
            <option value="box">Box Plot</option>
            <option value="area">Area Chart</option>
          </select>
        </div>

        {chartType !== 'histogram' && chartType !== 'box' && (
          <div style={styles.controlGroup}>
            <label style={styles.label}>X-Axis (Category):</label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              style={styles.select}
            >
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={styles.controlGroup}>
          <label style={styles.label}>Y-Axis (Value):</label>
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            style={styles.select}
          >
            {numericColumns.length > 0
              ? numericColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))
              : columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
          </select>
        </div>

        <button onClick={handleSave} style={styles.saveBtn}>
          💾 Save Chart
        </button>
      </div>

      {/* Plotly Chart Render Area */}
      <div style={styles.chartWrapper}>
        <Plot
          data={getPlotTraces()}
          layout={{
            title: chartTitle,
            autosize: true,
            xaxis: { title: xAxis },
            yaxis: { title: yAxis },
            margin: { l: 50, r: 50, b: 80, t: 60, pad: 4 },
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '450px' }}
          config={{ responsive: true, displayModeBar: true }}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  controlBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '20px',
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#475569',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },
  saveBtn: {
    marginTop: 'auto',
    padding: '9px 18px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  chartWrapper: {
    width: '100%',
    minHeight: '450px',
  },
  placeholder: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
};

export default PlotlyVisualizer;