const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // Your JWT auth middleware
const {
  saveChart,
  getSavedCharts,
  deleteSavedChart,
  saveReport,
  getSavedReports,
  deleteSavedReport,
} = require("../controllers/savedItemsController");

router.use(protect);

// Chart endpoints
router.route("/charts").post(saveChart).get(getSavedCharts);
router.route("/charts/:id").delete(deleteSavedChart);

// Report endpoints
router.route("/reports").post(saveReport).get(getSavedReports);
router.route("/reports/:id").delete(deleteSavedReport);

module.exports = router;
