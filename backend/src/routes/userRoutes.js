const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAvailableDrivers,  // Make sure this is included
  resetUserPassword,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isTransportOfficer } = require('../middleware/roleMiddleware');

// All routes are protected
router.use(protect);

// Admin only routes
router.route('/')
  .get(isAdmin, getUsers)
  .post(isAdmin, createUser);

// Transport officer route for getting available drivers - THIS IS LINE 23
router.get('/drivers/available', isTransportOfficer, getAvailableDrivers); 

// Admin routes with ID parameter - THIS IS LINE 25
router.route('/:id')
  .get(isAdmin, getUserById)
  .put(isAdmin, updateUser)
  .delete(isAdmin, deleteUser);

// Additional admin routes
router.get('/stats', isAdmin, getUserStats);
router.post('/:id/reset-password', isAdmin, resetUserPassword);

module.exports = router;