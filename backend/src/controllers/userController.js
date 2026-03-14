const User = require('../models/User');
const bcrypt = require('bcryptjs');

//////////////////////////////////////////////////////
// CREATE USER (Admin Only)
//////////////////////////////////////////////////////
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      employeeId,
      department,
      phoneNumber,
      licenseNumber,
      licenseExpiry,
      address
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password and role'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    if (role === 'driver' && !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'License number is required for drivers'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      employeeId,
      department,
      phoneNumber,
      licenseNumber: role === 'driver' ? licenseNumber : undefined,
      licenseExpiry: role === 'driver' ? licenseExpiry : undefined,
      address,
      createdBy: req.user._id,
      isActive: true
    });

    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating user'
    });
  }
};

//////////////////////////////////////////////////////
// GET ALL USERS (Admin Only)
//////////////////////////////////////////////////////
const getUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      search,
      department,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (department) query.department = department;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    const total = await User.countDocuments(query);

    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ isActive: true }),
      inactive: await User.countDocuments({ isActive: false }),
      byRole: {
        admin: await User.countDocuments({ role: 'admin' }),
        staff: await User.countDocuments({ role: 'staff' }),
        transport: await User.countDocuments({ role: 'transport' }),
        driver: await User.countDocuments({ role: 'driver' })
      }
    };

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      stats
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

//////////////////////////////////////////////////////
// GET USER BY ID (Admin Only)
//////////////////////////////////////////////////////
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

//////////////////////////////////////////////////////
// UPDATE USER (Admin Only)
//////////////////////////////////////////////////////
const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      employeeId,
      department,
      phoneNumber,
      licenseNumber,
      licenseExpiry,
      address,
      isActive
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.employeeId = employeeId || user.employeeId;
    user.department = department || user.department;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    if (user.role === 'driver') {
      user.licenseNumber = licenseNumber || user.licenseNumber;
      user.licenseExpiry = licenseExpiry || user.licenseExpiry;
    }

    user.address = address || user.address;

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

//////////////////////////////////////////////////////
// DELETE USER (Soft Delete)
//////////////////////////////////////////////////////
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

//////////////////////////////////////////////////////
// RESET PASSWORD (Admin Only)
//////////////////////////////////////////////////////
const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting password'
    });
  }
};

//////////////////////////////////////////////////////
// GET USER STATS (Admin Only)
//////////////////////////////////////////////////////
const getUserStats = async (req, res) => {
  try {
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ isActive: true }),
      newThisMonth: await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) }
      }),
      byRole: {
        admin: await User.countDocuments({ role: 'admin' }),
        staff: await User.countDocuments({ role: 'staff' }),
        transport: await User.countDocuments({ role: 'transport' }),
        driver: await User.countDocuments({ role: 'driver' })
      },
      recentLogins: await User.find({ lastLogin: { $ne: null } })
        .select('name email role lastLogin')
        .sort('-lastLogin')
        .limit(10)
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

//////////////////////////////////////////////////////
// GET AVAILABLE DRIVERS (Transport Only)
//////////////////////////////////////////////////////
const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await User.find({
      role: 'driver',
      isActive: true
    })
      .select('name email employeeId phoneNumber licenseNumber licenseExpiry')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      drivers
    });

  } catch (error) {
    console.error('Get available drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching drivers'
    });
  }
};

//////////////////////////////////////////////////////
// EXPORTS
//////////////////////////////////////////////////////
module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats,
  getAvailableDrivers
};