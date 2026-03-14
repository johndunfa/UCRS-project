const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  maintenanceId: {
    type: String,
    unique: true,
    default: function() {
      return 'MNT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['routine', 'repair', 'emergency', 'damage', 'inspection'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'in-progress', 'completed', 'rejected'],
    default: 'pending'
  },
  scheduledDate: Date,
  completionDate: Date,
  estimatedCost: Number,
  actualCost: Number,
  odometerAtService: Number,
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  notes: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

maintenanceSchema.index({ vehicle: 1, status: 1 });
maintenanceSchema.index({ requestedBy: 1 });
maintenanceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);