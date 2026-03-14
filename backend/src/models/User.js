const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'transport', 'driver'],
    required: [true, 'Role is required']
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  department: {
    type: String,
    trim: true,
    default: ''
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  licenseNumber: {
    type: String,
    trim: true,
    required: function() {
      return this.role === 'driver';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ===============================
// Pre-save hook for password hashing and passwordChangedAt
// ===============================
userSchema.pre('save', async function(next) {
  try {
    // Only hash password if modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);

      // Update passwordChangedAt if not new user
      if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// ===============================
// Compare entered password with hashed password
// ===============================
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ===============================
// Check if password was changed after JWT issued
// ===============================
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// ===============================
// Indexes
// ===============================
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);