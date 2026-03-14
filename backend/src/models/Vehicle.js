const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9-]+$/, 'Registration number can only contain letters, numbers, and hyphens']
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be 2000 or later'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  color: {
    type: String,
    trim: true
  },
  fuelType: {
    type: String,
    enum: {
      values: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
      message: '{VALUE} is not a valid fuel type'
    },
    required: [true, 'Fuel type is required']
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual'
  },
  seatingCapacity: {
    type: Number,
    required: [true, 'Seating capacity is required'],
    min: [2, 'Seating capacity must be at least 2'],
    max: [50, 'Seating capacity cannot exceed 50']
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'assigned', 'maintenance', 'out-of-service', 'reserved'],
      message: '{VALUE} is not a valid status'
    },
    default: 'available'
  },
  currentDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: {
      type: Date,
      required: [true, 'Insurance expiry date is required']
    },
    coverage: String
  },
  registration: {
    expiryDate: {
      type: Date,
      required: [true, 'Registration expiry date is required']
    },
    issuedDate: Date,
    issuingAuthority: String
  },
  maintenance: {
    lastService: {
      type: Date,
      default: null
    },
    nextService: {
      type: Date,
      default: null
    },
    lastServiceMileage: {
      type: Number,
      default: 0
    },
    serviceInterval: {
      type: Number, // in kilometers
      default: 5000
    },
    notes: String
  },
  specifications: {
    engine: String,
    horsepower: Number,
    fuelTankCapacity: Number, // in liters
    mileage: Number, // km/l or km/charge
    features: [String]
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date
  }],
  mileage: {
    type: Number,
    default: 0,
    min: [0, 'Mileage cannot be negative']
  },
  fuelLevel: {
    type: Number,
    min: [0, 'Fuel level cannot be negative'],
    max: [100, 'Fuel level cannot exceed 100'],
    default: 100
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location-based queries
vehicleSchema.index({ currentLocation: '2dsphere' });

// Virtual for trips
vehicleSchema.virtual('trips', {
  ref: 'Trip',
  localField: '_id',
  foreignField: 'vehicle',
  justOne: false
});

// Virtual for maintenance records
vehicleSchema.virtual('maintenanceRecords', {
  ref: 'Maintenance',
  localField: '_id',
  foreignField: 'vehicle',
  justOne: false
});

// Indexes for better query performance
vehicleSchema.index({ registrationNumber: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ 'insurance.expiryDate': 1 });
vehicleSchema.index({ 'registration.expiryDate': 1 });
vehicleSchema.index({ 'maintenance.nextService': 1 });
vehicleSchema.index({ currentDriver: 1 });

// Middleware to update status based on maintenance
vehicleSchema.pre('save', function(next) {
  if (this.maintenance.nextService && this.maintenance.nextService < new Date()) {
    if (this.status === 'available') {
      this.status = 'maintenance';
    }
  }
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);