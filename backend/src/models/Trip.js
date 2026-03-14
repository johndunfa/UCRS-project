const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  tripId: {
    type: String,
    unique: true,
    default: function () {
      return 'TRIP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  },

  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
    unique: true
  },

  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },

  // Locations
  startLocation: {
    type: String,
    required: true
  },

  endLocation: {
    type: String,
    required: true
  },

  // Time tracking
  startTime: {
    type: Date,
    required: true
  },

  estimatedEndTime: {
    type: Date,
    required: true
  },

  actualStartTime: Date,
  actualEndTime: Date,

  // Odometer
  startOdometer: {
    type: Number,
    required: true,
    min: 0
  },

  endOdometer: {
    type: Number,
    min: 0,
    validate: {
      validator: function (value) {
        return !value || value >= this.startOdometer;
      },
      message: 'End odometer must be greater than or equal to start odometer'
    }
  },

  distance: {
    type: Number,
    min: 0
  },

  // Fuel tracking
  fuelStartLevel: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },

  fuelEndLevel: {
    type: Number,
    min: 0,
    max: 100
  },

  fuelUsed: {
    type: Number,
    min: 0
  },

  fuelRefilled: [{
    amount: Number,
    cost: Number,
    location: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // Waypoints (optional stops)
  waypoints: [{
    location: String,
    arrivalTime: Date,
    departureTime: Date,
    purpose: String
  }],

  // Passengers
  passengers: [{
    name: String,
    department: String,
    contactNumber: String,
    signedIn: { type: Boolean, default: false },
    signedInTime: Date,
    signedOutTime: Date
  }],

  // Trip Notes
  notes: String,

  // Report
  report: {
    submitted: { type: Boolean, default: false },
    submittedAt: Date,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    summary: String,
    incidents: [{
      description: String,
      location: String,
      time: Date,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      resolved: { type: Boolean, default: false }
    }]
  },

  // Expenses
  expenses: [{
    type: {
      type: String,
      enum: ['fuel', 'toll', 'parking', 'maintenance', 'other']
    },
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now },
    approved: { type: Boolean, default: false }
  }],

  // Feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: Date
  },

  // Audit
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
  timestamps: true
});


// Indexes
tripSchema.index({ tripId: 1 });
tripSchema.index({ request: 1 });
tripSchema.index({ vehicle: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ startTime: 1 });
tripSchema.index({ createdAt: -1 });


// Middleware
tripSchema.pre('save', function (next) {

  // Calculate distance
  if (this.startOdometer != null && this.endOdometer != null) {
    this.distance = this.endOdometer - this.startOdometer;
  }

  // Calculate fuel used
  if (this.fuelStartLevel != null && this.fuelEndLevel != null) {
    const totalRefueled = this.fuelRefilled?.reduce((sum, refill) => sum + (refill.amount || 0), 0) || 0;
    this.fuelUsed = this.fuelStartLevel - this.fuelEndLevel + totalRefueled;
  }

  // Auto status update
  if (this.actualStartTime && !this.actualEndTime) {
    this.status = 'in-progress';
  }

  if (this.actualStartTime && this.actualEndTime) {
    this.status = 'completed';
  }

  next();
});

module.exports = mongoose.model('Trip', tripSchema);