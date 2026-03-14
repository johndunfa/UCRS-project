const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  getLogById,
  getSystemHealth
} = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// All routes require authentication and admin role
router.use(protect, isAdmin);

router.get('/', getActivityLogs);
router.get('/health', getSystemHealth);
router.get('/:id', getLogById);

module.exports = router;