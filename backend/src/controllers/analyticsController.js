const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Request = require('../models/Request');
const Trip = require('../models/Trip');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin & Transport
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Basic counts
    const stats = {
      vehicles: {
        total: await Vehicle.countDocuments(),
        available: await Vehicle.countDocuments({ status: 'available' }),
        assigned: await Vehicle.countDocuments({ status: 'assigned' }),
        maintenance: await Vehicle.countDocuments({ status: 'maintenance' }),
        outOfService: await Vehicle.countDocuments({ status: 'out-of-service' })
      },
      requests: {
        total: await Request.countDocuments(),
        pending: await Request.countDocuments({ status: 'pending' }),
        approved: await Request.countDocuments({ status: 'approved' }),
        rejected: await Request.countDocuments({ status: 'rejected' }),
        completed: await Request.countDocuments({ status: 'completed' }),
        cancelled: await Request.countDocuments({ status: 'cancelled' })
      },
      trips: {
        total: await Trip.countDocuments(),
        scheduled: await Trip.countDocuments({ status: 'scheduled' }),
        inProgress: await Trip.countDocuments({ status: 'in-progress' }),
        completed: await Trip.countDocuments({ status: 'completed' }),
        cancelled: await Trip.countDocuments({ status: 'cancelled' })
      },
      users: {
        total: await User.countDocuments({ isActive: true }),
        admins: await User.countDocuments({ role: 'admin', isActive: true }),
        staff: await User.countDocuments({ role: 'staff', isActive: true }),
        transport: await User.countDocuments({ role: 'transport', isActive: true }),
        drivers: await User.countDocuments({ role: 'driver', isActive: true })
      }
    };

    // Time-based statistics
    const timeStats = {
      today: {
        requests: await Request.countDocuments({
          createdAt: { $gte: startOfDay }
        }),
        trips: await Trip.countDocuments({
          startTime: { $gte: startOfDay }
        })
      },
      thisWeek: {
        requests: await Request.countDocuments({
          createdAt: { $gte: startOfWeek }
        }),
        trips: await Trip.countDocuments({
          startTime: { $gte: startOfWeek }
        })
      },
      thisMonth: {
        requests: await Request.countDocuments({
          createdAt: { $gte: startOfMonth }
        }),
        trips: await Trip.countDocuments({
          startTime: { $gte: startOfMonth }
        })
      },
      thisYear: {
        requests: await Request.countDocuments({
          createdAt: { $gte: startOfYear }
        }),
        trips: await Trip.countDocuments({
          startTime: { $gte: startOfYear }
        })
      }
    };

    res.status(200).json({
      success: true,
      stats,
      timeStats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

// @desc    Get request statistics with trends
// @route   GET /api/analytics/requests
// @access  Private/Admin
const getRequestAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Requests by status over time
    const requestsByStatus = await Request.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Requests by priority
    const requestsByPriority = await Request.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily request trends
    const dailyTrends = await Request.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Average processing time
    const avgProcessingTime = await Request.aggregate([
      {
        $match: {
          status: 'completed',
          approvedAt: { $exists: true }
        }
      },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$approvedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$processingTime' },
          min: { $min: '$processingTime' },
          max: { $max: '$processingTime' }
        }
      }
    ]);

    // Requests by department
    const requestsByDepartment = await Request.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        byStatus: requestsByStatus,
        byPriority: requestsByPriority,
        dailyTrends,
        avgProcessingTime: avgProcessingTime[0] || { average: 0, min: 0, max: 0 },
        byDepartment: requestsByDepartment
      }
    });

  } catch (error) {
    console.error('Request analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching request analytics'
    });
  }
};

// @desc    Get vehicle analytics
// @route   GET /api/analytics/vehicles
// @access  Private/Admin & Transport
const getVehicleAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Vehicle status distribution
    const vehiclesByStatus = await Vehicle.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          vehicles: { $push: { registrationNumber: '$registrationNumber', model: '$model' } }
        }
      }
    ]);

    // Vehicles by fuel type
    const vehiclesByFuelType = await Vehicle.aggregate([
      {
        $group: {
          _id: '$fuelType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Vehicle utilization (trips per vehicle)
    const vehicleUtilization = await Trip.aggregate([
      {
        $match: {
          startTime: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$vehicle',
          tripCount: { $sum: 1 },
          totalDistance: { $sum: '$distance' }
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicleInfo'
        }
      },
      {
        $unwind: '$vehicleInfo'
      },
      {
        $project: {
          registrationNumber: '$vehicleInfo.registrationNumber',
          model: '$vehicleInfo.model',
          make: '$vehicleInfo.make',
          tripCount: 1,
          totalDistance: 1
        }
      },
      { $sort: { tripCount: -1 } },
      { $limit: 10 }
    ]);

    // Upcoming maintenance
    const upcomingMaintenance = await Vehicle.find({
      'maintenance.nextService': {
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    })
      .select('registrationNumber model make maintenance.nextService')
      .sort('maintenance.nextService')
      .limit(10);

    // Expiring documents
    const expiringDocuments = await Vehicle.find({
      $or: [
        { 'insurance.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
        { 'registration.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }
      ]
    })
      .select('registrationNumber model make insurance.expiryDate registration.expiryDate')
      .limit(10);

    res.status(200).json({
      success: true,
      analytics: {
        byStatus: vehiclesByStatus,
        byFuelType: vehiclesByFuelType,
        utilization: vehicleUtilization,
        upcomingMaintenance,
        expiringDocuments
      }
    });

  } catch (error) {
    console.error('Vehicle analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle analytics'
    });
  }
};

// @desc    Get trip analytics
// @route   GET /api/analytics/trips
// @access  Private/Admin & Transport
const getTripAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Trips by status
    const tripsByStatus = await Trip.aggregate([
      {
        $match: {
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily trip trends
    const dailyTrips = await Trip.aggregate([
      {
        $match: {
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' },
            day: { $dayOfMonth: '$startTime' }
          },
          count: { $sum: 1 },
          totalDistance: { $sum: '$distance' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top drivers by trips
    const topDrivers = await Trip.aggregate([
      {
        $match: {
          startTime: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$driver',
          tripCount: { $sum: 1 },
          totalDistance: { $sum: '$distance' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'driverInfo'
        }
      },
      {
        $unwind: '$driverInfo'
      },
      {
        $project: {
          driverName: '$driverInfo.name',
          employeeId: '$driverInfo.employeeId',
          tripCount: 1,
          totalDistance: 1
        }
      },
      { $sort: { tripCount: -1 } },
      { $limit: 10 }
    ]);

    // Average trip distance
    const avgTripDistance = await Trip.aggregate([
      {
        $match: {
          startTime: { $gte: startDate },
          status: 'completed',
          distance: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$distance' },
          min: { $min: '$distance' },
          max: { $max: '$distance' },
          total: { $sum: '$distance' }
        }
      }
    ]);

    // Trips by vehicle type
    const tripsByVehicleType = await Trip.aggregate([
      {
        $match: {
          startTime: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicle',
          foreignField: '_id',
          as: 'vehicleInfo'
        }
      },
      {
        $unwind: '$vehicleInfo'
      },
      {
        $group: {
          _id: '$vehicleInfo.fuelType',
          count: { $sum: 1 },
          totalDistance: { $sum: '$distance' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        byStatus: tripsByStatus,
        dailyTrends: dailyTrips,
        topDrivers,
        avgDistance: avgTripDistance[0] || { average: 0, min: 0, max: 0, total: 0 },
        byVehicleType: tripsByVehicleType
      }
    });

  } catch (error) {
    console.error('Trip analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip analytics'
    });
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private/Admin
const getUserAnalytics = async (req, res) => {
  try {
    // User distribution by role
    const usersByRole = await User.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // New user registrations over time
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // Last 90 days

    const newUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Most active users (by requests)
    const mostActiveUsers = await Request.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$requestedBy',
          requestCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          userName: '$userInfo.name',
          department: '$userInfo.department',
          requestCount: 1
        }
      },
      { $sort: { requestCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        byRole: usersByRole,
        newUsers,
        mostActiveUsers
      }
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user analytics'
    });
  }
};

// @desc    Get system overview (for main dashboard)
// @route   GET /api/analytics/overview
// @access  Private/Admin
const getSystemOverview = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    // Real-time status
    const overview = {
      current: {
        activeTrips: await Trip.countDocuments({ status: 'in-progress' }),
        pendingRequests: await Request.countDocuments({ status: 'pending' }),
        availableVehicles: await Vehicle.countDocuments({ status: 'available' }),
        activeDrivers: await Trip.aggregate([
          {
            $match: {
              status: 'in-progress'
            }
          },
          {
            $group: {
              _id: '$driver'
            }
          },
          {
            $count: 'count'
          }
        ])
      },
      today: {
        requests: await Request.countDocuments({
          createdAt: { $gte: startOfDay }
        }),
        trips: await Trip.countDocuments({
          startTime: { $gte: startOfDay }
        }),
        completedTrips: await Trip.countDocuments({
          status: 'completed',
          actualEndTime: { $gte: startOfDay }
        })
      },
      utilization: {
        vehicleUtilization: await calculateVehicleUtilization(),
        requestApprovalRate: await calculateApprovalRate(),
        driverProductivity: await calculateDriverProductivity()
      }
    };

    res.status(200).json({
      success: true,
      overview
    });

  } catch (error) {
    console.error('System overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching system overview'
    });
  }
};

// Helper functions
const calculateVehicleUtilization = async () => {
  const total = await Vehicle.countDocuments();
  const inUse = await Vehicle.countDocuments({ status: 'assigned' });
  return total ? (inUse / total) * 100 : 0;
};

const calculateApprovalRate = async () => {
  const total = await Request.countDocuments({
    status: { $in: ['approved', 'rejected'] }
  });
  const approved = await Request.countDocuments({ status: 'approved' });
  return total ? (approved / total) * 100 : 0;
};

const calculateDriverProductivity = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completedTrips = await Trip.countDocuments({
    status: 'completed',
    actualEndTime: { $gte: thirtyDaysAgo }
  });

  const activeDrivers = await User.countDocuments({ 
    role: 'driver', 
    isActive: true 
  });

  return activeDrivers ? completedTrips / activeDrivers : 0;
};

module.exports = {
  getDashboardStats,
  getRequestAnalytics,
  getVehicleAnalytics,
  getTripAnalytics,
  getUserAnalytics,
  getSystemOverview
};