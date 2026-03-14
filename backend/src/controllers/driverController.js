const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');

// @desc    Get my assigned trips
// @route   GET /api/driver/trips
// @access  Private/Driver
const getMyTrips = async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'startTime',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    let query = { driver: req.user._id };

    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with population
    const trips = await Trip.find(query)
      .populate({
        path: 'request',
        populate: {
          path: 'requestedBy',
          select: 'name department phoneNumber'
        }
      })
      .populate('vehicle', 'registrationNumber model make color')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Trip.countDocuments(query);

    // Get statistics
    const stats = {
      total: await Trip.countDocuments({ driver: req.user._id }),
      scheduled: await Trip.countDocuments({ driver: req.user._id, status: 'scheduled' }),
      inProgress: await Trip.countDocuments({ driver: req.user._id, status: 'in-progress' }),
      completed: await Trip.countDocuments({ driver: req.user._id, status: 'completed' }),
      todayTrips: await Trip.countDocuments({
        driver: req.user._id,
        startTime: {
          $gte: new Date().setHours(0, 0, 0),
          $lte: new Date().setHours(23, 59, 59)
        }
      })
    };

    res.status(200).json({
      success: true,
      trips,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get my trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trips'
    });
  }
};

// @desc    Get single trip by ID
// @route   GET /api/driver/trips/:id
// @access  Private/Driver
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate({
        path: 'request',
        populate: {
          path: 'requestedBy',
          select: 'name department phoneNumber email'
        }
      })
      .populate('vehicle', 'registrationNumber model make color fuelType')
      .populate('driver', 'name email phoneNumber');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if driver owns this trip
    if (trip.driver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this trip'
      });
    }

    res.status(200).json({
      success: true,
      trip
    });

  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip'
    });
  }
};

// @desc    Start trip
// @route   PUT /api/driver/trips/:id/start
// @access  Private/Driver
const startTrip = async (req, res) => {
  try {
    const { startOdometer, fuelLevel, notes } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if driver owns this trip
    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to start this trip'
      });
    }

    // Check if trip can be started
    if (trip.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot start trip with status: ${trip.status}`
      });
    }

    // Validate required fields
    if (!startOdometer) {
      return res.status(400).json({
        success: false,
        message: 'Start odometer reading is required'
      });
    }

    // Update trip
    trip.status = 'in-progress';
    trip.actualStartTime = new Date();
    trip.startOdometer = startOdometer;
    if (fuelLevel) trip.fuelStartLevel = fuelLevel;
    if (notes) trip.notes = notes;

    await trip.save();

    // Update vehicle status
    await Vehicle.findByIdAndUpdate(trip.vehicle, {
      status: 'assigned',
      currentDriver: req.user._id
    });

    // Create notification for transport officer
    await Notification.create({
      recipientRole: 'transport',
      type: 'trip_started',
      title: 'Trip Started',
      message: `Trip #${trip.tripId} has been started by driver ${req.user.name}`,
      reference: {
        model: 'Trip',
        id: trip._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Trip started successfully',
      trip
    });

  } catch (error) {
    console.error('Start trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting trip'
    });
  }
};

// @desc    End trip
// @route   PUT /api/driver/trips/:id/end
// @access  Private/Driver
const endTrip = async (req, res) => {
  try {
    const { endOdometer, fuelLevel, notes, issues } = req.body;
    const trip = await Trip.findById(req.params.id).populate('vehicle');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if driver owns this trip
    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to end this trip'
      });
    }

    // Check if trip can be ended
    if (trip.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot end trip with status: ${trip.status}`
      });
    }

    // Validate required fields
    if (!endOdometer) {
      return res.status(400).json({
        success: false,
        message: 'End odometer reading is required'
      });
    }

    if (endOdometer < trip.startOdometer) {
      return res.status(400).json({
        success: false,
        message: 'End odometer cannot be less than start odometer'
      });
    }

    // Calculate distance
    const distance = endOdometer - trip.startOdometer;

    // Update trip
    trip.status = 'completed';
    trip.actualEndTime = new Date();
    trip.endOdometer = endOdometer;
    trip.distance = distance;
    if (fuelLevel) trip.fuelEndLevel = fuelLevel;
    if (fuelLevel && trip.fuelStartLevel) {
      trip.fuelUsed = trip.fuelStartLevel - fuelLevel;
    }
    
    // Update report if issues
    if (issues) {
      trip.report = {
        submitted: true,
        submittedAt: new Date(),
        submittedBy: req.user._id,
        issues: issues,
        notes: notes || ''
      };
    } else if (notes) {
      trip.notes = notes;
    }

    await trip.save();

    // Update vehicle status and mileage
    await Vehicle.findByIdAndUpdate(trip.vehicle._id, {
      status: 'available',
      currentDriver: null,
      mileage: endOdometer,
      fuelLevel: fuelLevel || trip.vehicle.fuelLevel
    });

    // Update request status
    const Request = require('../models/Request');
    await Request.findByIdAndUpdate(trip.request, {
      status: 'completed',
      actualCost: distance * 2 // Example calculation
    });

    // Create notification
    await Notification.create({
      recipientRole: 'transport',
      type: 'trip_completed',
      title: 'Trip Completed',
      message: `Trip #${trip.tripId} has been completed by driver ${req.user.name}`,
      reference: {
        model: 'Trip',
        id: trip._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Trip completed successfully',
      trip
    });

  } catch (error) {
    console.error('End trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while ending trip'
    });
  }
};

// @desc    Submit trip report
// @route   POST /api/driver/trips/:id/report
// @access  Private/Driver
const submitTripReport = async (req, res) => {
  try {
    const { notes, issues, attachments } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if driver owns this trip
    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to report on this trip'
      });
    }

    // Update report
    trip.report = {
      submitted: true,
      submittedAt: new Date(),
      submittedBy: req.user._id,
      notes: notes || '',
      issues: issues || '',
      attachments: attachments || []
    };

    await trip.save();

    // If there are issues, notify transport officer
    if (issues) {
      await Notification.create({
        recipientRole: 'transport',
        type: 'vehicle_issue',
        title: 'Vehicle Issue Reported',
        message: `Driver ${req.user.name} reported an issue with vehicle: ${issues}`,
        reference: {
          model: 'Trip',
          id: trip._id
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report submitted successfully',
      report: trip.report
    });

  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting report'
    });
  }
};

// @desc    Submit maintenance request
// @route   POST /api/driver/maintenance/request
// @access  Private/Driver
const submitMaintenanceRequest = async (req, res) => {
  try {
    const { vehicleId, type, description, urgency } = req.body;

    if (!vehicleId || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicle, type, and description'
      });
    }

    // Verify vehicle is assigned to this driver
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      currentDriver: req.user._id
    });

    if (!vehicle) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to request maintenance for this vehicle'
      });
    }

    // Create maintenance request (you may have a separate Maintenance model)
    const Maintenance = require('../models/Maintenance');
    const maintenance = await Maintenance.create({
      vehicle: vehicleId,
      requestedBy: req.user._id,
      type,
      description,
      urgency: urgency || 'medium',
      status: 'pending',
      scheduledDate: new Date(),
      odometerAtService: vehicle.mileage || 0
    });

    // Notify transport officer
    await Notification.create({
      recipientRole: 'transport',
      type: 'maintenance_request',
      title: 'Maintenance Request',
      message: `Driver ${req.user.name} requested maintenance for ${vehicle.registrationNumber}`,
      reference: {
        model: 'Maintenance',
        id: maintenance._id
      },
      priority: urgency === 'urgent' ? 'high' : 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance request submitted successfully',
      maintenance
    });

  } catch (error) {
    console.error('Maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting maintenance request'
    });
  }
};

// @desc    Get driver dashboard stats
// @route   GET /api/driver/stats
// @access  Private/Driver
const getDriverStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      totalTrips: await Trip.countDocuments({ driver: req.user._id }),
      completedTrips: await Trip.countDocuments({ 
        driver: req.user._id, 
        status: 'completed' 
      }),
      scheduledToday: await Trip.countDocuments({
        driver: req.user._id,
        status: 'scheduled',
        startTime: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }),
      inProgress: await Trip.countDocuments({ 
        driver: req.user._id, 
        status: 'in-progress' 
      }),
      totalDistance: await Trip.aggregate([
        { $match: { driver: req.user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$distance' } } }
      ])
    };

    // Get current assignment
    const currentTrip = await Trip.findOne({
      driver: req.user._id,
      status: { $in: ['scheduled', 'in-progress'] }
    })
      .populate('vehicle', 'registrationNumber model make')
      .populate({
        path: 'request',
        select: 'destination purpose startTime endTime'
      })
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      stats: {
        ...stats,
        totalDistance: stats.totalDistance[0]?.total || 0
      },
      currentTrip
    });

  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

module.exports = {
  getMyTrips,
  getTripById,
  startTrip,
  endTrip,
  submitTripReport,
  submitMaintenanceRequest,
  getDriverStats
};