const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Import controllers
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats
} = require('../controllers/userController');

const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  getVehicleStats
} = require('../controllers/vehicleController');

const {
  generateReport,
  getReports,
  getSystemLogs,
  getDashboardStats
} = require('../controllers/reportController');

// All routes require authentication and admin role
router.use(protect, isAdmin);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// User management routes
router.get('/users/stats', getUserStats);
router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.post('/users/:id/reset-password', resetUserPassword);

// Fleet management routes
router.get('/vehicles/stats', getVehicleStats);
router.route('/vehicles')
  .get(getVehicles)
  .post(createVehicle);

router.route('/vehicles/:id')
  .get(getVehicleById)
  .put(updateVehicle)
  .delete(deleteVehicle);

router.patch('/vehicles/:id/status', updateVehicleStatus);

// Reports and logs
router.post('/reports/generate', generateReport);
router.get('/reports', getReports);
router.get('/logs', getSystemLogs);

module.exports = router;