const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({

  // ===============================
  // BASIC INFO
  // ===============================

  reportId: {
    type: String,
    unique: true,
    default: function () {
      return 'RPT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: String,

  category: {
    type: String,
    enum: ['operational', 'financial', 'performance', 'compliance', 'custom'],
    default: 'operational'
  },

  type: {
    type: String,
    enum: [
      'activity_log',
      'request_summary',
      'trip_summary',
      'vehicle_utilization',
      'driver_performance',
      'maintenance_report',
      'fuel_consumption',
      'cost_analysis',
      'custom'
    ],
    required: true
  },

  format: {
    type: String,
    enum: ['json', 'pdf', 'excel', 'csv'],
    default: 'json'
  },

  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending'
  },

  version: {
    type: Number,
    default: 1
  },

  // ===============================
  // DATE RANGE
  // ===============================

  dateRange: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
    }
  },

  // ===============================
  // FILTERS
  // ===============================

  filters: {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }],
    drivers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    departments: [String],
    statuses: [String],
    locations: [String]
  },

  parameters: mongoose.Schema.Types.Mixed,

  // ===============================
  // REPORT DATA
  // ===============================

  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  summary: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  charts: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // ===============================
  // FILE STORAGE
  // ===============================

  fileUrl: String,
  fileName: String,
  fileSize: Number,
  fileMimeType: String,

  downloads: {
    type: Number,
    default: 0
  },

  lastDownloadedAt: Date,

  // ===============================
  // SCHEDULING
  // ===============================

  isScheduled: {
    type: Boolean,
    default: false
  },

  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    nextRun: Date,
    lastRun: Date,
    recipients: [{
      email: String,
      name: String
    }]
  },

  // ===============================
  // PERFORMANCE METRICS
  // ===============================

  executionTimeMs: Number,
  recordCount: Number,

  errorLog: [{
    message: String,
    stack: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // ===============================
  // ACCESS CONTROL
  // ===============================

  visibility: {
    type: String,
    enum: ['private', 'department', 'organization'],
    default: 'private'
  },

  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permissions: {
      type: String,
      enum: ['view', 'download', 'edit'],
      default: 'view'
    },
    sharedAt: { type: Date, default: Date.now }
  }],

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  approvedAt: Date,

  // ===============================
  // ORGANIZATION (Multi-tenant ready)
  // ===============================

  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },

  // ===============================
  // METADATA
  // ===============================

  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  generatedAt: {
    type: Date,
    default: Date.now
  },

  expiresAt: Date,

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: Date,

  notes: String

}, {
  timestamps: true
});


// ===============================
// INDEXES
// ===============================

reportSchema.index({ reportId: 1 });
reportSchema.index({ type: 1, generatedAt: -1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ 'dateRange.start': 1, 'dateRange.end': 1 });
reportSchema.index({ 'schedule.nextRun': 1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto delete


module.exports = mongoose.model('Report', reportSchema);