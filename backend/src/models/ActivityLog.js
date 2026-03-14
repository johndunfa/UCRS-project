const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    unique: true,
    default: function() {
      return 'LOG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DEACTIVATED',
      'USER_LOGIN',
      'USER_LOGOUT',
      
      'REQUEST_CREATED',
      'REQUEST_APPROVED',
      'REQUEST_REJECTED',
      'REQUEST_CANCELLED',
      'REQUEST_UPDATED',
      
      'VEHICLE_ADDED',
      'VEHICLE_UPDATED',
      'VEHICLE_DELETED',
      'VEHICLE_STATUS_CHANGED',
      
      'TRIP_STARTED',
      'TRIP_COMPLETED',
      'TRIP_CANCELLED',
      
      'DRIVER_ASSIGNED',
      'VEHICLE_ASSIGNED',
      
      'MAINTENANCE_REQUESTED',
      'MAINTENANCE_COMPLETED',
      
      'REPORT_GENERATED'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['admin', 'transport', 'staff', 'driver', 'system'],
    required: true
  },
  targetType: {
    type: String,
    enum: ['user', 'request', 'vehicle', 'trip', 'driver', 'maintenance', 'report'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType'
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ 'userRole': 1 });
activityLogSchema.index({ createdAt: -1 });

// Compound indexes for common queries
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ targetType: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);