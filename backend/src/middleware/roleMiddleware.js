// Check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }
    
    next();
  };
};

// Specific role middleware functions
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  next();
};

const isTransportOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
  
  if (!['admin', 'transport'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Transport officer access required'
    });
  }
  
  next();
};

const isDriver = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
  
  if (req.user.role !== 'driver') {
    return res.status(403).json({
      success: false,
      message: 'Driver access required'
    });
  }
  
  next();
};

const isStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
  
  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Staff access required'
    });
  }
  
  next();
};

// Check if user is accessing their own resource or has admin role
const isOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId.toString()) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource'
    });
  };
};

// Check permissions based on action and resource
const hasPermission = (action, resource) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    const permissions = {
      admin: {
        create: ['user', 'vehicle', 'request', 'trip', 'report'],
        read: ['user', 'vehicle', 'request', 'trip', 'report', 'dashboard'],
        update: ['user', 'vehicle', 'request', 'trip', 'report'],
        delete: ['user', 'vehicle', 'request', 'trip', 'report']
      },
      transport: {
        create: ['vehicle', 'request', 'trip', 'report'],
        read: ['vehicle', 'request', 'trip', 'report', 'driver', 'dashboard'],
        update: ['vehicle', 'request', 'trip', 'report'],
        delete: ['request', 'trip']
      },
      staff: {
        create: ['request'],
        read: ['request', 'trip', 'vehicle'],
        update: ['request'],
        delete: ['request']
      },
      driver: {
        create: ['tripReport'],
        read: ['trip', 'vehicle'],
        update: ['trip'],
        delete: []
      }
    };
    
    const userPermissions = permissions[req.user.role];
    
    if (!userPermissions || !userPermissions[action] || !userPermissions[action].includes(resource)) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to ${action} ${resource}`
      });
    }
    
    next();
  };
};

module.exports = {
  authorize,
  isAdmin,
  isTransportOfficer,
  isDriver,
  isStaff,
  isOwnerOrAdmin,
  hasPermission
};