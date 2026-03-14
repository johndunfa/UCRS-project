const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null // null means broadcast to role
  },
  recipientRole: {
    type: String,
    enum: ['admin', 'transport', 'staff', 'driver']
  },
  type: {
    type: String,
    enum: [
      'request_created',
      'request_approved',
      'request_rejected',
      'request_cancelled',
      'request_assigned',
      'trip_started',
      'trip_completed',
      'vehicle_assigned',
      'driver_assigned'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  reference: {
    model: {
      type: String,
      enum: ['Request', 'Trip', 'Vehicle', 'User']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reference.model'
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);