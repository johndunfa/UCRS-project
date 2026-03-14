const express = require('express');
const router = express.Router();
const {
  getPendingRequests,
  getApprovedRequests,
  approveRequest,
  rejectRequest,
  getAvailableVehicles,
  getAvailableDrivers,
  assignVehicleAndDriver,
  getTransportStats
} = require('../controllers/transportController');
const { protect } = require('../middleware/authMiddleware');
const { isTransportOfficer } = require('../middleware/roleMiddleware'); // Changed from isTransport

// All routes require authentication and transport officer role
router.use(protect, isTransportOfficer); // Changed from isTransport

router.get('/stats', getTransportStats);
router.get('/pending-requests', getPendingRequests);
router.get('/approved-requests', getApprovedRequests);
router.put('/requests/:id/approve', approveRequest);
router.put('/requests/:id/reject', rejectRequest);
router.get('/vehicles/available', getAvailableVehicles);
router.get('/drivers/available', getAvailableDrivers);
router.post('/requests/:id/assign', assignVehicleAndDriver);

module.exports = router;