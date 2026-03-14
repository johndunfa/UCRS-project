const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Request = require('../models/Request');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// @desc    Create activity log
const createLog = async (req, res, next) => {
  try {
    const { action, targetType, targetId, description, details, status = 'success' } = req.body;
    
    const log = await ActivityLog.create({
      action,
      user: req.user?._id || null,
      userRole: req.user?.role || 'system',
      targetType,
      targetId,
      description,
      details,
      status,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    });

    // Attach log to request for other middleware
    req.activityLog = log;
    
    // Don't block the main request
    if (next) next();
    
  } catch (error) {
    console.error('Error creating activity log:', error);
    // Don't throw error - logging should not break the main request
  }
};

// @desc    Get activity logs with filters
// @route   GET /api/logs
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
  try {
    const {
      action,
      user,
      targetType,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};

    if (action) query.action = action;
    if (user) query.user = user;
    if (targetType) query.targetType = targetType;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await ActivityLog.countDocuments(query);

    // Get unique actions for filter
    const uniqueActions = await ActivityLog.distinct('action');

    // Statistics
    const stats = {
      total: await ActivityLog.countDocuments(),
      today: await ActivityLog.countDocuments({
        timestamp: {
          $gte: new Date().setHours(0, 0, 0),
          $lte: new Date().setHours(23, 59, 59)
        }
      }),
      byAction: await ActivityLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      byUser: await ActivityLog.aggregate([
        { $group: { _id: '$userRole', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    };

    res.status(200).json({
      success: true,
      logs,
      stats,
      filters: {
        actions: uniqueActions
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching logs'
    });
  }
};

// @desc    Get log by ID
// @route   GET /api/logs/:id
// @access  Private/Admin
const getLogById = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
      .populate('user', 'name email role')
      .populate({
        path: 'targetId',
        refPath: 'targetType'
      });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    res.status(200).json({
      success: true,
      log
    });

  } catch (error) {
    console.error('Get log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching log'
    });
  }
};

// @desc    Get system health logs
// @route   GET /api/logs/health
// @access  Private/Admin
const getSystemHealth = async (req, res) => {
  try {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const health = {
      errorRate: await calculateErrorRate(),
      activeUsers: await getActiveUsers(),
      systemLoad: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      recentErrors: await ActivityLog.find({
        status: 'failure',
        timestamp: { $gte: lastHour }
      })
        .populate('user', 'name')
        .sort('-timestamp')
        .limit(10)
    };

    res.status(200).json({
      success: true,
      health
    });

  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching system health'
    });
  }
};

// Helper functions
const calculateErrorRate = async () => {
  const total = await ActivityLog.countDocuments({
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  const errors = await ActivityLog.countDocuments({
    status: 'failure',
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  return total ? (errors / total) * 100 : 0;
};

const getActiveUsers = async () => {
  return await ActivityLog.distinct('user', {
    timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
  }).then(users => users.length);
};

module.exports = {
  createLog,
  getActivityLogs,
  getLogById,
  getSystemHealth
};