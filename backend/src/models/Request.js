const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    default: function() {
      return 'REQ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requestor is required']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true,
    minlength: [1, 'Purpose must be at least 10 characters'],
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  numberOfPassengers: {
    type: Number,
    required: [true, 'Number of passengers is required'],
    min: [1, 'At least 1 passenger is required'],
    max: [50, 'Cannot exceed 50 passengers']
  },
  vehicleType: {
    type: String,
    enum: {
      values: ['sedan', 'suv', 'van', 'bus', 'any', 'luxury'],
      message: '{VALUE} is not a valid vehicle type'
    },
    default: 'any'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'assigned', 'in-progress', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tripType: {
    type: String,
    enum: ['one-way', 'round-trip', 'multi-stop'],
    default: 'one-way'
  },
  stops: [{
    location: String,
    purpose: String,
    estimatedArrival: Date,
    estimatedDeparture: Date
  }],
  estimatedDistance: {
    type: Number, // in kilometers
    min: [0, 'Distance cannot be negative']
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: [0, 'Duration cannot be negative']
  },
  specialRequirements: {
    type: String,
    maxlength: [300, 'Special requirements cannot exceed 300 characters']
  },
  
  // Approval fields
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  approvalNotes: {
    type: String
  },
  
  // Assignment fields
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  
  // Rejection/Cancellation
  rejectionReason: {
    type: String,
    maxlength: [300, 'Rejection reason cannot exceed 300 characters']
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxlength: [300, 'Cancellation reason cannot exceed 300 characters']
  },
  
  // Additional info
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  projectCode: {
    type: String
  },
  costCenter: {
    type: String
  },
  estimatedCost: {
    type: Number,
    min: [0, 'Estimated cost cannot be negative']
  },
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative']
  },
  
  // Attachments
  attachments: [{
    filename: String,
    fileType: String,
    fileSize: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  notes: [{
    text: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for associated trip
requestSchema.virtual('trip', {
  ref: 'Trip',
  localField: '_id',
  foreignField: 'request',
  justOne: true
});

// Indexes for better query performance
requestSchema.index({ requestId: 1 });
requestSchema.index({ requestedBy: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ startDate: 1 });
requestSchema.index({ approvedBy: 1 });
requestSchema.index({ assignedVehicle: 1 });
requestSchema.index({ assignedDriver: 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ priority: 1 });
requestSchema.index({ department: 1 });

// Compound indexes for common queries
requestSchema.index({ status: 1, startDate: 1 });
requestSchema.index({ requestedBy: 1, status: 1 });
requestSchema.index({ assignedDriver: 1, status: 1 });

// Middleware to update timestamps on status change
requestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'approved' && !this.approvedAt) {
      this.approvedAt = new Date();
    }
    if (this.status === 'assigned' && !this.assignedAt) {
      this.assignedAt = new Date();
    }
    if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Request', requestSchema);