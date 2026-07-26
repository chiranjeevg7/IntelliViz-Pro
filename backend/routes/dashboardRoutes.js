/**
 * Dashboard Routes
 * Endpoint declarations for /api/v1/dashboards
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createDashboard,
  getUserDashboards,
  getDashboardById,
  updateDashboard,
  deleteDashboard,
} = require("../controllers/dashboardController");

// All dashboard routes require authentication
router.use(protect);

router.route("/").post(createDashboard).get(getUserDashboards);

router
  .route("/:id")
  .get(getDashboardById)
  .put(updateDashboard)
  .delete(deleteDashboard);

module.exports = router;
