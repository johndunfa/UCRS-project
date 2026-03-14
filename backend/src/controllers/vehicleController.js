const Vehicle = require('../models/Vehicle');

// @desc    Create new vehicle (Admin only)
// @route   POST /api/admin/vehicles
// @access  Private/Admin
const createVehicle = async (req, res) => {
  try {
    const {
      registrationNumber,
      model,
      make,
      year,
      color,
      fuelType,
      transmission,
      seatingCapacity,
      insurance,
      registration,
      specifications
    } = req.body;

    // Check if vehicle exists
    const existingVehicle = await Vehicle.findOne({ registrationNumber });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this registration number already exists'
      });
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      model,
      make,
      year,
      color,
      fuelType,
      transmission,
      seatingCapacity,
      insurance,
      registration,
      specifications,
      status: 'available',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      vehicle
    });

  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding vehicle',
      error: error.message
    });
  }
};

// @desc    Get all vehicles with filters (Admin only)
// @route   GET /api/admin/vehicles
// @access  Private/Admin
const getVehicles = async (req, res) => {
  try {
    const {
      status,
      fuelType,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    let query = {};

    if (status) query.status = status;
    if (fuelType) query.fuelType = fuelType;
    
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const vehicles = await Vehicle.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('currentDriver', 'name')
      .populate('createdBy', 'name');

    const total = await Vehicle.countDocuments(query);

    // Statistics
    const stats = {
      total: await Vehicle.countDocuments(),
      available: await Vehicle.countDocuments({ status: 'available' }),
      assigned: await Vehicle.countDocuments({ status: 'assigned' }),
      maintenance: await Vehicle.countDocuments({ status: 'maintenance' }),
      outOfService: await Vehicle.countDocuments({ status: 'out-of-service' })
    };

    res.status(200).json({
      success: true,
      vehicles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      stats
    });

  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicles'
    });
  }
};

// @desc    Get single vehicle by ID
// @route   GET /api/admin/vehicles/:id
// @access  Private/Admin
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('currentDriver', 'name email phoneNumber')
      .populate('createdBy', 'name email');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      vehicle
    });

  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle'
    });
  }
};

// @desc    Update vehicle (Admin only)
// @route   PUT /api/admin/vehicles/:id
// @access  Private/Admin
const updateVehicle = async (req, res) => {
  try {
    const {
      registrationNumber,
      model,
      make,
      year,
      color,
      fuelType,
      transmission,
      seatingCapacity,
      status,
      insurance,
      registration,
      maintenance,
      specifications,
      condition,
      notes
    } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Update fields
    vehicle.registrationNumber = registrationNumber || vehicle.registrationNumber;
    vehicle.model = model || vehicle.model;
    vehicle.make = make || vehicle.make;
    vehicle.year = year || vehicle.year;
    vehicle.color = color || vehicle.color;
    vehicle.fuelType = fuelType || vehicle.fuelType;
    vehicle.transmission = transmission || vehicle.transmission;
    vehicle.seatingCapacity = seatingCapacity || vehicle.seatingCapacity;
    vehicle.status = status || vehicle.status;
    vehicle.insurance = insurance || vehicle.insurance;
    vehicle.registration = registration || vehicle.registration;
    vehicle.maintenance = { ...vehicle.maintenance, ...maintenance };
    vehicle.specifications = { ...vehicle.specifications, ...specifications };
    vehicle.condition = condition || vehicle.condition;
    vehicle.notes = notes || vehicle.notes;

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle
    });

  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating vehicle'
    });
  }
};

// @desc    Delete vehicle (Admin only)
// @route   DELETE /api/admin/vehicles/:id
// @access  Private/Admin
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle is assigned
    if (vehicle.status === 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle that is currently assigned'
      });
    }

    await vehicle.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting vehicle'
    });
  }
};

// @desc    Update vehicle status
// @route   PATCH /api/admin/vehicles/:id/status
// @access  Private/Admin
const updateVehicleStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    vehicle.status = status;
    if (status === 'maintenance') {
      vehicle.maintenance.notes = reason || 'Status changed to maintenance';
    }

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Vehicle status updated successfully',
      vehicle
    });

  } catch (error) {
    console.error('Update vehicle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating vehicle status'
    });
  }
};

// @desc    Get vehicle statistics for dashboard
// @route   GET /api/admin/vehicles/stats/dashboard
// @access  Private/Admin
const getVehicleStats = async (req, res) => {
  try {
    const stats = {
      total: await Vehicle.countDocuments(),
      available: await Vehicle.countDocuments({ status: 'available' }),
      assigned: await Vehicle.countDocuments({ status: 'assigned' }),
      maintenance: await Vehicle.countDocuments({ status: 'maintenance' }),
      
      // Fleet composition
      byFuelType: {
        petrol: await Vehicle.countDocuments({ fuelType: 'petrol' }),
        diesel: await Vehicle.countDocuments({ fuelType: 'diesel' }),
        electric: await Vehicle.countDocuments({ fuelType: 'electric' }),
        hybrid: await Vehicle.countDocuments({ fuelType: 'hybrid' })
      },
      
      // Upcoming maintenance
      dueForService: await Vehicle.countDocuments({
        'maintenance.nextService': { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      }),
      
      // Expiring documents
      insuranceExpiring: await Vehicle.countDocuments({
        'insurance.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      }),
      registrationExpiring: await Vehicle.countDocuments({
        'registration.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      })
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  getVehicleStats
};