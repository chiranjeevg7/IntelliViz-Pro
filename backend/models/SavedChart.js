const mongoose = require("mongoose");

const savedChartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title for the chart"],
      trim: true,
    },
    chartType: {
      type: String,
      required: true,
      enum: [
        "bar",
        "line",
        "pie",
        "scatter",
        "histogram",
        "heatmap",
        "area",
        "boxplot",
      ],
    },
    xAxis: { type: String, required: true },
    yAxis: { type: String },
    chartImage: { type: String }, // Base64 image or file path string
    config: { type: Object, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SavedChart", savedChartSchema);
