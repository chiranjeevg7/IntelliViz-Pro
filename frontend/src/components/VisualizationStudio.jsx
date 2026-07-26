import React, { useState, useEffect, useRef } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-basic-dist-min";

const Plot = createPlotlyComponent(Plotly);

const VisualizationStudio = ({ dataset, rows }) => {
  const [chartType, setChartType] = useState("bar");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [plotData, setPlotData] = useState([]);
  
  // Ref to target the Plotly DOM element for downloading
  const plotRef = useRef(null);

  const columns = dataset?.columns?.map((c) => c.name) || Object.keys(rows[0] || {});

  useEffect(() => {
    if (columns.length > 0) {
      setXAxis(columns[0]);
      if (columns.length > 1) setYAxis(columns[1]);
    }
  }, [dataset]);

  useEffect(() => {
    if (!rows || rows.length === 0 || !xAxis) return;

    const xValues = rows.map((r) => r[xAxis]);
    const yValues = yAxis ? rows.map((r) => r[yAxis]) : [];

    if (chartType === "histogram") {
      setPlotData([
        {
          x: xValues,
          type: "histogram",
          marker: { color: "#3B82F6" },
        },
      ]);
    } else {
      setPlotData([
        {
          x: xValues,
          y: yValues,
          type: chartType,
          mode: chartType === "scatter" ? "markers" : undefined,
          marker: { color: "#6366F1" },
        },
      ]);
    }
  }, [rows, xAxis, yAxis, chartType]);

  // 📸 Function to handle chart image export
  const handleExport = (format) => {
    if (!plotRef.current) return;

    // Retrieve the internal unwrap div created by react-plotly
    const graphDiv = plotRef.current.el;

    const chartTitle = `${dataset?.originalName || "chart"}_${chartType}_${xAxis}`;

    Plotly.downloadImage(graphDiv, {
      format: format, // 'png' | 'svg' | 'jpeg' | 'webp'
      width: 1200,    // High resolution width
      height: 700,    // High resolution height
      filename: chartTitle.toLowerCase().replace(/\s+/g, "_"),
    });
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Control Panel */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "16px", borderRadius: "8px" }}>
        
        {/* Dropdown Controls */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>Chart Type</label>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)} style={{ padding: "8px", borderRadius: "4px" }}>
              <option value="bar">Bar Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="histogram">Histogram</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>X-Axis Column</label>
            <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} style={{ padding: "8px", borderRadius: "4px" }}>
              {columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {chartType !== "histogram" && (
            <div>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>Y-Axis Column</label>
              <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} style={{ padding: "8px", borderRadius: "4px" }}>
                {columns.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 📥 Custom Export Buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleExport("png")}
            style={{ padding: "8px 14px", background: "#2563EB", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
          >
            Export PNG
          </button>
          <button
            onClick={() => handleExport("svg")}
            style={{ padding: "8px 14px", background: "#059669", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
          >
            Export SVG
          </button>
        </div>

      </div>

      {/* Plot Area */}
      <div style={{ background: "#ffffff", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <Plot
          ref={plotRef} // 👈 Reference attached here
          data={plotData}
          layout={{
            autosize: true,
            title: `${chartType.toUpperCase()}: ${xAxis}${yAxis ? ` vs ${yAxis}` : ""}`,
            margin: { t: 40, r: 20, l: 40, b: 40 },
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "450px" }}
          // ⚙️ Configure built-in Plotly hover toolbar options
          config={{
            responsive: true,
            toImageButtonOptions: {
              format: "png",
              filename: "custom_chart",
              height: 700,
              width: 1200,
              scale: 2, // High DPI / Crisp output
            },
          }}
        />
      </div>
    </div>
  );
};

export default VisualizationStudio;