const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRequestAnalytics,
  getVehicleAnalytics,
  getTripAnalytics,
  getUserAnalytics,
  getSystemOverview
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isTransportOfficer } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// Main dashboard stats (accessible by admin and transport)
router.get('/dashboard', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'transport') {
    return getDashboardStats(req, res, next);
  }
  return res.status(403).json({ message: 'Access denied' });
});

// System overview (admin only)
router.get('/overview', isAdmin, getSystemOverview);

// Detailed analytics (admin only)
router.get('/requests', isAdmin, getRequestAnalytics);
router.get('/vehicles', isAdmin, getVehicleAnalytics);
router.get('/trips', isAdmin, getTripAnalytics);
router.get('/users', isAdmin, getUserAnalytics);

module.exports = router;