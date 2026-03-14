const express = require('express');
const router = express.Router();
const {
  generateActivityReport,
  generateRequestReport,
  generateTripReport,
  generateMaintenanceReport,
  getReports,
  getReportById,
  downloadReport,
  deleteReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// All routes require authentication and admin role
router.use(protect, isAdmin);

// Report generation
router.post('/activity', generateActivityReport);
router.post('/requests', generateRequestReport);
router.post('/trips', generateTripReport);
router.post('/maintenance', generateMaintenanceReport);

// Report management
router.get('/', getReports);
router.get('/:id', getReportById);
router.get('/:id/download', downloadReport);
router.delete('/:id', deleteReport);

module.exports = router;