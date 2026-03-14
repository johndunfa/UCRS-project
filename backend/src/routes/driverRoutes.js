const express = require('express');
const router = express.Router();
const {
  getMyTrips,
  getTripById,
  startTrip,
  endTrip,
  submitTripReport,
  submitMaintenanceRequest,
  getDriverStats
} = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');
const { isDriver } = require('../middleware/roleMiddleware');

// All routes require authentication and driver role
router.use(protect, isDriver);

// Dashboard stats
router.get('/stats', getDriverStats);

// Trip management
router.get('/trips', getMyTrips);
router.get('/trips/:id', getTripById);
router.put('/trips/:id/start', startTrip);
router.put('/trips/:id/end', endTrip);
router.post('/trips/:id/report', submitTripReport);

// Maintenance requests
router.post('/maintenance/request', submitMaintenanceRequest);

module.exports = router;