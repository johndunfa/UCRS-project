const Request = require('../models/Request');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Notification = require('../models/Notification');

// @desc    Get all pending requests
// @route   GET /api/transport/pending-requests
// @access  Private/Transport
const getPendingRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      priority,
      startDate,
      endDate,
      search
    } = req.query;

    // Build query
    let query = { status: 'pending' };

    if (priority) query.priority = priority;
    
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { purpose: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { requestId: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const requests = await Request.find(query)
      .populate('requestedBy', 'name email department phoneNumber')
      .sort({ priority: -1, createdAt: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Request.countDocuments(query);

    // Get statistics
    const stats = {
      total: await Request.countDocuments({ status: 'pending' }),
      highPriority: await Request.countDocuments({ status: 'pending', priority: 'high' }),
      urgent: await Request.countDocuments({ status: 'pending', priority: 'urgent' }),
      today: await Request.countDocuments({
        status: 'pending',
        startDate: {
          $gte: new Date().setHours(0, 0, 0),
          $lte: new Date().setHours(23, 59, 59)
        }
      })
    };

    res.status(200).json({
      success: true,
      requests,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching requests'
    });
  }
};

// @desc    Get all approved requests ready for assignment
// @route   GET /api/transport/approved-requests
// @access  Private/Transport
const getApprovedRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      assigned = 'false'
    } = req.query;

    // Base query for approved requests
    let query = { 
      status: 'approved'
    };

    // If assigned=false, show only unassigned approved requests
    // If assigned=true, show all approved requests (both assigned and unassigned)
    if (assigned === 'false') {
      query.assignedVehicle = null;
    }

    console.log('Approved requests query:', JSON.stringify(query));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const requests = await Request.find(query)
      .populate('requestedBy', 'name email department phoneNumber')
      .populate('assignedVehicle', 'registrationNumber make model color seatingCapacity fuelType')
      .populate('assignedDriver', 'name phoneNumber email')
      .sort({ startDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Request.countDocuments(query);

    console.log(`Found ${requests.length} approved requests (total: ${total})`);

    res.status(200).json({
      success: true,
      requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get approved requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching requests'
    });
  }
};

// @desc    Approve request
// @route   PUT /api/transport/requests/:id/approve
// @access  Private/Transport
const approveRequest = async (req, res) => {
  try {
    const { approvalNotes } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${request.status}`
      });
    }

    request.status = 'approved';
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    request.approvalNotes = approvalNotes || 'Request approved';

    await request.save();

    // Create notification for staff
    await Notification.create({
      recipient: request.requestedBy,
      type: 'request_approved',
      title: 'Request Approved',
      message: `Your request #${request.requestId} has been approved`,
      reference: {
        model: 'Request',
        id: request._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Request approved successfully',
      request
    });

  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving request'
    });
  }
};

// @desc    Reject request
// @route   PUT /api/transport/requests/:id/reject
// @access  Private/Transport
const rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${request.status}`
      });
    }

    request.status = 'rejected';
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    request.rejectionReason = rejectionReason;

    await request.save();

    // Create notification for staff
    await Notification.create({
      recipient: request.requestedBy,
      type: 'request_rejected',
      title: 'Request Rejected',
      message: `Your request #${request.requestId} has been rejected`,
      reference: {
        model: 'Request',
        id: request._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Request rejected successfully',
      request
    });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting request'
    });
  }
};

// @desc    Get available vehicles for assignment
// @route   GET /api/transport/vehicles/available
// @access  Private/Transport
const getAvailableVehicles = async (req, res) => {
  try {
    const { 
      seatingCapacity,
      fuelType,
      date 
    } = req.query;

    let query = { 
      status: 'available'
    };

    if (seatingCapacity) {
      query.seatingCapacity = { $gte: parseInt(seatingCapacity) };
    }

    if (fuelType) {
      query.fuelType = fuelType;
    }

    // Check vehicle availability for specific date
    if (date) {
      const bookedVehicles = await Trip.distinct('vehicle', {
        status: { $in: ['scheduled', 'in-progress'] },
        startTime: { $lte: new Date(date) },
        estimatedEndTime: { $gte: new Date(date) }
      });
      
      query._id = { $nin: bookedVehicles };
    }

    const vehicles = await Vehicle.find(query)
      .select('registrationNumber model make year seatingCapacity fuelType status')
      .sort('model');

    // Get counts by type
    const counts = {
      total: vehicles.length,
      byType: {
        sedan: vehicles.filter(v => v.seatingCapacity <= 4).length,
        suv: vehicles.filter(v => v.seatingCapacity > 4 && v.seatingCapacity <= 7).length,
        van: vehicles.filter(v => v.seatingCapacity > 7 && v.seatingCapacity <= 15).length,
        bus: vehicles.filter(v => v.seatingCapacity > 15).length
      }
    };

    res.status(200).json({
      success: true,
      vehicles,
      counts
    });

  } catch (error) {
    console.error('Get available vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicles'
    });
  }
};

// @desc    Get available drivers for assignment
// @route   GET /api/transport/drivers/available
// @access  Private/Transport
const getAvailableDrivers = async (req, res) => {
  try {
    const { date } = req.query;

    let query = { 
      role: 'driver',
      isActive: true 
    };

    // Check driver availability for specific date
    if (date) {
      const assignedDrivers = await Trip.distinct('driver', {
        status: { $in: ['scheduled', 'in-progress'] },
        startTime: { $lte: new Date(date) },
        estimatedEndTime: { $gte: new Date(date) }
      });
      
      query._id = { $nin: assignedDrivers };
    }

    const drivers = await User.find(query)
      .select('name email employeeId phoneNumber licenseNumber')
      .sort('name');

    res.status(200).json({
      success: true,
      drivers,
      total: drivers.length
    });

  } catch (error) {
    console.error('Get available drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching drivers'
    });
  }
};

// @desc    Assign vehicle and driver to request
// @route   POST /api/transport/requests/:id/assign
// @access  Private/Transport
const assignVehicleAndDriver = async (req, res) => {
  const session = await Request.startSession();
  session.startTransaction();

  try {
    const { vehicleId, driverId, notes } = req.body;
    const requestId = req.params.id;

    console.log('=== ASSIGNMENT REQUEST ===');
    console.log('Request ID:', requestId);
    console.log('Vehicle ID:', vehicleId);
    console.log('Driver ID:', driverId);

    // Validate required fields
    if (!vehicleId || !driverId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please select both vehicle and driver'
      });
    }

    // Get request
    const request = await Request.findById(requestId).session(session);
    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    console.log('Request found:', { 
      id: request._id, 
      status: request.status,
      destination: request.destination 
    });

    if (request.status !== 'approved') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot assign to request with status: ${request.status}`
      });
    }

    // Check vehicle availability
    const vehicle = await Vehicle.findById(vehicleId).session(session);
    if (!vehicle) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.status !== 'available') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Vehicle ${vehicle.registrationNumber} is not available (status: ${vehicle.status})`
      });
    }

    console.log('Vehicle found:', { 
      id: vehicle._id, 
      reg: vehicle.registrationNumber,
      status: vehicle.status 
    });

    // Check driver availability
    const driver = await User.findOne({ 
      _id: driverId, 
      role: 'driver', 
      isActive: true 
    }).session(session);
    
    if (!driver) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Driver not found or not active'
      });
    }

    console.log('Driver found:', { 
      id: driver._id, 
      name: driver.name,
      phone: driver.phoneNumber 
    });

    // Check if driver is already assigned for this time period
    const existingAssignment = await Trip.findOne({
      driver: driverId,
      status: { $in: ['scheduled', 'in-progress'] },
      $or: [
        {
          startTime: { $lte: new Date(request.endDate) },
          estimatedEndTime: { $gte: new Date(request.startDate) }
        }
      ]
    }).session(session);

    if (existingAssignment) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Driver is already assigned for this time period'
      });
    }

    // Update vehicle status
    vehicle.status = 'assigned';
    vehicle.currentDriver = driverId;
    await vehicle.save({ session });

    // Update request
    request.status = 'assigned';
    request.assignedVehicle = vehicleId;
    request.assignedDriver = driverId;
    request.assignedBy = req.user._id;
    request.assignedAt = new Date();
    await request.save({ session });

    // Create trip
    const trip = await Trip.create([{
      request: requestId,
      vehicle: vehicleId,
      driver: driverId,
      startLocation: request.destination,
      endLocation: request.destination,
      startTime: new Date(`${request.startDate}T${request.startTime}`),
      estimatedEndTime: new Date(`${request.endDate}T${request.endTime}`),
      startOdometer: vehicle.mileage || 0,
      fuelStartLevel: vehicle.fuelLevel || 100,
      status: 'scheduled',
      createdBy: req.user._id,
      notes: notes || ''
    }], { session });

    console.log('Trip created:', { id: trip[0]._id });

    // Commit transaction
    await session.commitTransaction();

    // Populate for response
    await request.populate([
      { path: 'assignedVehicle', select: 'registrationNumber make model color' },
      { path: 'assignedDriver', select: 'name phoneNumber email' }
    ]);

    // Create notifications (don't fail if they error)
    try {
      await Notification.create([
        {
          recipient: request.requestedBy,
          type: 'request_assigned',
          title: 'Vehicle Assigned',
          message: `Vehicle ${vehicle.registrationNumber} has been assigned to your request. Driver: ${driver.name} - Contact: ${driver.phoneNumber || 'Not provided'}`,
          reference: { model: 'Request', id: request._id }
        },
        {
          recipient: driverId,
          type: 'driver_assigned',
          title: 'New Trip Assigned',
          message: `You have been assigned to trip #${trip[0].tripId}`,
          reference: { model: 'Trip', id: trip[0]._id }
        }
      ]);
    } catch (notifError) {
      console.error('Notification creation failed (non-critical):', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle and driver assigned successfully',
      request,
      trip: trip[0]
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('=== ASSIGNMENT ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while assigning vehicle',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get transport dashboard statistics
// @route   GET /api/transport/stats
// @access  Private/Transport
const getTransportStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      pending: {
        total: await Request.countDocuments({ status: 'pending' }),
        urgent: await Request.countDocuments({ status: 'pending', priority: 'urgent' }),
        high: await Request.countDocuments({ status: 'pending', priority: 'high' })
      },
      approved: await Request.countDocuments({ status: 'approved' }),
      assigned: await Request.countDocuments({ status: 'assigned' }),
      todayTrips: await Trip.countDocuments({
        startTime: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }),
      vehicles: {
        available: await Vehicle.countDocuments({ status: 'available' }),
        total: await Vehicle.countDocuments()
      },
      drivers: {
        available: await User.countDocuments({ role: 'driver', isActive: true }),
        total: await User.countDocuments({ role: 'driver' })
      }
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get transport stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

module.exports = {
  getPendingRequests,
  getApprovedRequests,
  approveRequest,
  rejectRequest,
  getAvailableVehicles,
  getAvailableDrivers,
  assignVehicleAndDriver,
  getTransportStats
};