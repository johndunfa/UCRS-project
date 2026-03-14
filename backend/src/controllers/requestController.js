const Request = require('../models/Request');
const Notification = require('../models/Notification');

// @desc    Create new request (Staff only)
// @route   POST /api/requests
// @access  Private/Staff
const createRequest = async (req, res) => {
  try {
    const {
      purpose,
      destination,
      startDate,
      endDate,
      startTime,
      endTime,
      numberOfPassengers,
      vehicleType,
      priority,
      tripType,
      stops,
      estimatedDistance,
      specialRequirements,
      department,
      projectCode,
      costCenter
    } = req.body;

    // Validate required fields
    if (!purpose || !destination || !startDate || !endDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: purpose, destination, startDate, endDate, startTime, endTime'
      });
    }

    // Validate dates
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date/time must be after start date/time'
      });
    }

    // Check if user exists in request
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Create request
    const requestData = {
      requestedBy: req.user._id,
      purpose,
      destination,
      startDate,
      endDate,
      startTime,
      endTime,
      numberOfPassengers: numberOfPassengers || 1,
      vehicleType: vehicleType || 'any',
      priority: priority || 'medium',
      tripType: tripType || 'one-way',
      stops: stops || [],
      estimatedDistance,
      specialRequirements,
      department: department || req.user.department || 'Not specified',
      projectCode,
      costCenter,
      status: 'pending',
      createdBy: req.user._id
    };

    const request = await Request.create(requestData);

    // Populate requested by field
    await request.populate('requestedBy', 'name email department');

    // Create notification for transport officers
    try {
      await Notification.create({
        recipient: null,
        type: 'request_created',
        title: 'New Request Submitted',
        message: `${req.user.name} has submitted a new vehicle request`,
        reference: {
          model: 'Request',
          id: request._id
        },
        priority: 'medium'
      });
    } catch (notifError) {
      console.error('Notification creation error:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      request
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get staff's own requests with driver details (UPDATED)
// @route   GET /api/requests/my-requests
// @access  Private/Staff
const getMyRequests = async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { requestedBy: req.user._id };

    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with populated driver details
    const requests = await Request.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('approvedBy', 'name')
      .populate('assignedVehicle', 'registrationNumber model make color')
      .populate('assignedDriver', 'name phoneNumber email') // Added phoneNumber and email
      .populate('trip');

    // Get total count
    const total = await Request.countDocuments(query);

    // Get statistics
    const stats = {
      total: await Request.countDocuments({ requestedBy: req.user._id }),
      pending: await Request.countDocuments({ requestedBy: req.user._id, status: 'pending' }),
      approved: await Request.countDocuments({ requestedBy: req.user._id, status: 'approved' }),
      rejected: await Request.countDocuments({ requestedBy: req.user._id, status: 'rejected' }),
      completed: await Request.countDocuments({ requestedBy: req.user._id, status: 'completed' }),
      assigned: await Request.countDocuments({ 
        requestedBy: req.user._id, 
        status: 'approved',
        assignedDriver: { $ne: null }
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
    console.error('Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching requests'
    });
  }
};

// @desc    Get single request by ID with driver details (UPDATED)
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requestedBy', 'name email department phoneNumber')
      .populate('approvedBy', 'name')
      .populate('assignedVehicle', 'registrationNumber model make color')
      .populate('assignedDriver', 'name phoneNumber email licenseNumber') // Added full driver details
      .populate('trip')
      .populate('notes.createdBy', 'name');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user has permission to view this request
    if (request.requestedBy._id.toString() !== req.user._id.toString() && 
        !['admin', 'transport'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this request'
      });
    }

    res.status(200).json({
      success: true,
      request
    });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching request'
    });
  }
};

// @desc    Update request (Staff only - can only update pending requests)
// @route   PUT /api/requests/:id
// @access  Private/Staff
const updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user owns this request
    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own requests'
      });
    }

    // Check if request can be updated (only pending)
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update request with status: ${request.status}`
      });
    }

    // Update fields
    const updatableFields = [
      'purpose', 'destination', 'startDate', 'endDate', 'startTime', 'endTime',
      'numberOfPassengers', 'vehicleType', 'priority', 'tripType', 'stops',
      'estimatedDistance', 'specialRequirements', 'projectCode', 'costCenter'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        request[field] = req.body[field];
      }
    });

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      request
    });

  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating request'
    });
  }
};

// @desc    Cancel request (Staff only)
// @route   PUT /api/requests/:id/cancel
// @access  Private/Staff
const cancelRequest = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user owns this request
    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests'
      });
    }

    // Check if request can be cancelled
    if (!['pending', 'approved'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel request with status: ${request.status}`
      });
    }

    request.status = 'cancelled';
    request.cancelledBy = req.user._id;
    request.cancelledAt = new Date();
    request.cancellationReason = cancellationReason || 'Cancelled by requester';

    await request.save();

    // Create notification for transport officers
    try {
      await Notification.create({
        recipient: null,
        type: 'request_cancelled',
        title: 'Request Cancelled',
        message: `${req.user.name} has cancelled their request`,
        reference: {
          model: 'Request',
          id: request._id
        },
        priority: 'medium'
      });
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      request
    });

  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling request'
    });
  }
};

// @desc    Add note to request
// @route   POST /api/requests/:id/notes
// @access  Private
const addRequestNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required'
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check permission
    if (request.requestedBy.toString() !== req.user._id.toString() && 
        !['admin', 'transport'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add notes to this request'
      });
    }

    request.notes.push({
      text,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      note: request.notes[request.notes.length - 1]
    });

  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note'
    });
  }
};

// @desc    Get request statistics for staff dashboard
// @route   GET /api/requests/stats/dashboard
// @access  Private/Staff
const getRequestStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    const stats = {
      total: await Request.countDocuments({ requestedBy: req.user._id }),
      pending: await Request.countDocuments({ 
        requestedBy: req.user._id, 
        status: 'pending' 
      }),
      approved: await Request.countDocuments({ 
        requestedBy: req.user._id, 
        status: 'approved' 
      }),
      rejected: await Request.countDocuments({ 
        requestedBy: req.user._id, 
        status: 'rejected' 
      }),
      completed: await Request.countDocuments({ 
        requestedBy: req.user._id, 
        status: 'completed' 
      }),
      thisMonth: await Request.countDocuments({ 
        requestedBy: req.user._id,
        createdAt: { $gte: startOfMonth }
      }),
      thisWeek: await Request.countDocuments({ 
        requestedBy: req.user._id,
        createdAt: { $gte: startOfWeek }
      }),
      upcomingTrips: await Request.countDocuments({
        requestedBy: req.user._id,
        status: 'approved',
        startDate: { $gte: new Date() }
      })
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequest,
  cancelRequest,
  addRequestNote,
  getRequestStats
};