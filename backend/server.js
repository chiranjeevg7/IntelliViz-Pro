/**
 * IntelliViz Pro v2.0 - Core Server Entry Point
 * Architecture: Node.js / Express REST API
 */

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const datasetRoutes = require("./routes/datasetRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const contactRoutes = require("./routes/contact");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// ==========================================
// 1. MIDDLEWARE SETUP
// ==========================================

// Enable Cross-Origin Resource Sharing (CORS) for frontend interaction
app.use(cors());

// Body parser middleware to handle JSON and URL-encoded payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static directory for uploaded datasets/files securely
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/dashboards", require("./routes/dashboardRoutes"));

app.use("/api/v1/contact", contactRoutes);

// ==========================================
// 2. HEALTH CHECK & BASE ROUTES
// ==========================================

/**
 * @route   GET /
 * @desc    API Base Sanity Check
 * @access  Public
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to IntelliViz Pro v2.0 API Server",
    status: "Healthy",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/v1/health
 * @desc    System Health Endpoint
 * @access  Public
 */
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    uptime: process.uptime(),
    status: "Active",
    environment: process.env.NODE_ENV || "development",
  });
});

// ==========================================
// 3. API ROUTE MOUNTING
// ==========================================

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/datasets", datasetRoutes.default || datasetRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1", analyticsRoutes); // Mount /charts under /api/v1
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/saved-items", require("./routes/savedItemsRoutes"));

// ==========================================
// 4. UNHANDLED ROUTE & ERROR HANDLING
// ==========================================

// Handle 404 Route Not Found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route Not Found - ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`[Server Error]: ${err.stack}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ==========================================
// 5. SERVER INITIALIZATION
// ==========================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 IntelliViz Pro Server running on port ${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`===========================================`);
});

// Handle unhandled promise rejections gracefully
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
