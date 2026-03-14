const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequest,
  cancelRequest,
  addRequestNote,
  getRequestStats
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { isStaff } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', isStaff, createRequest);
router.get('/my-requests', isStaff, getMyRequests);
router.get('/stats/dashboard', isStaff, getRequestStats);
router.put('/:id/cancel', isStaff, cancelRequest);
router.put('/:id', isStaff, updateRequest);
router.get('/:id', getRequestById);
router.post('/:id/notes', addRequestNote);

module.exports = router;