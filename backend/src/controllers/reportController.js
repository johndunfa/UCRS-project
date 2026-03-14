const Report = require('../models/Report');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Request = require('../models/Request');
const Trip = require('../models/Trip');
const { createLog } = require('./logController');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// @desc    Generate activity report
// @route   POST /api/reports/activity
// @access  Private/Admin
const generateActivityReport = async (req, res) => {
  try {
    const { startDate, endDate, filters, format = 'json' } = req.body;

    const query = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (filters) {
      if (filters.actions) query.action = { $in: filters.actions };
      if (filters.users) query.user = { $in: filters.users };
      if (filters.targetType) query.targetType = filters.targetType;
    }

    // Fetch logs
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort('-timestamp');

    // Generate summary
    const summary = {
      totalLogs: logs.length,
      uniqueUsers: [...new Set(logs.map(log => log.user?._id?.toString()))].length,
      actions: logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {}),
      byRole: logs.reduce((acc, log) => {
        acc[log.userRole] = (acc[log.userRole] || 0) + 1;
        return acc;
      }, {})
    };

    // Create report record
    const report = await Report.create({
      title: `Activity Report ${new Date().toLocaleDateString()}`,
      type: 'activity_log',
      format,
      dateRange: {
        start: startDate || new Date(0),
        end: endDate || new Date()
      },
      filters: filters || {},
      data: { logs },
      summary,
      generatedBy: req.user._id
    });

    // Log the report generation
    await createLog({
      body: {
        action: 'REPORT_GENERATED',
        targetType: 'report',
        targetId: report._id,
        description: `Generated activity report: ${report.title}`,
        details: { format, logCount: logs.length }
      }
    }, { user: req.user, ip: req.ip, get: () => {} }, () => {});

    // Return based on format
    if (format === 'json') {
      res.status(200).json({
        success: true,
        report
      });
    } else if (format === 'excel') {
      const excelBuffer = await generateExcelReport(logs, summary);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=activity-report-${Date.now()}.xlsx`);
      res.send(excelBuffer);
    } else if (format === 'pdf') {
      const pdfBuffer = await generatePDFReport(logs, summary);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=activity-report-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    }

  } catch (error) {
    console.error('Generate activity report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating report'
    });
  }
};

// @desc    Generate request summary report
// @route   POST /api/reports/requests
// @access  Private/Admin
const generateRequestReport = async (req, res) => {
  try {
    const { startDate, endDate, department, status } = req.body;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (department) query.department = department;
    if (status) query.status = status;

    const requests = await Request.find(query)
      .populate('requestedBy', 'name department')
      .populate('approvedBy', 'name')
      .populate('assignedVehicle', 'registrationNumber')
      .populate('assignedDriver', 'name');

    const summary = {
      total: requests.length,
      byStatus: requests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      }, {}),
      byPriority: requests.reduce((acc, req) => {
        acc[req.priority] = (acc[req.priority] || 0) + 1;
        return acc;
      }, {}),
      byDepartment: requests.reduce((acc, req) => {
        acc[req.department] = (acc[req.department] || 0) + 1;
        return acc;
      }, {}),
      averageProcessingTime: calculateAvgProcessingTime(requests)
    };

    const report = await Report.create({
      title: `Request Report ${new Date().toLocaleDateString()}`,
      type: 'request_summary',
      dateRange: {
        start: startDate || new Date(0),
        end: endDate || new Date()
      },
      filters: { department, status },
      data: { requests },
      summary,
      generatedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Generate request report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating report'
    });
  }
};

// @desc    Generate trip report
// @route   POST /api/reports/trips
// @access  Private/Admin
const generateTripReport = async (req, res) => {
  try {
    const { startDate, endDate, driverId, vehicleId } = req.body;

    const query = {};
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    if (driverId) query.driver = driverId;
    if (vehicleId) query.vehicle = vehicleId;

    const trips = await Trip.find(query)
      .populate('driver', 'name')
      .populate('vehicle', 'registrationNumber model')
      .populate('request', 'destination purpose');

    const summary = {
      totalTrips: trips.length,
      totalDistance: trips.reduce((sum, trip) => sum + (trip.distance || 0), 0),
      totalFuelUsed: trips.reduce((sum, trip) => sum + (trip.fuelUsed || 0), 0),
      averageDistance: trips.length ? trips.reduce((sum, trip) => sum + (trip.distance || 0), 0) / trips.length : 0,
      byDriver: trips.reduce((acc, trip) => {
        const driverName = trip.driver?.name || 'Unknown';
        acc[driverName] = (acc[driverName] || 0) + 1;
        return acc;
      }, {}),
      byVehicle: trips.reduce((acc, trip) => {
        const vehicleReg = trip.vehicle?.registrationNumber || 'Unknown';
        acc[vehicleReg] = (acc[vehicleReg] || 0) + 1;
        return acc;
      }, {})
    };

    const report = await Report.create({
      title: `Trip Report ${new Date().toLocaleDateString()}`,
      type: 'trip_summary',
      dateRange: {
        start: startDate || new Date(0),
        end: endDate || new Date()
      },
      filters: { driverId, vehicleId },
      data: { trips },
      summary,
      generatedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Generate trip report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating report'
    });
  }
};

// @desc    Generate maintenance report
// @route   POST /api/reports/maintenance
// @access  Private/Admin
const generateMaintenanceReport = async (req, res) => {
  try {
    const { startDate, endDate, vehicleId } = req.body;

    const Maintenance = require('../models/Maintenance');
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (vehicleId) query.vehicle = vehicleId;

    const maintenance = await Maintenance.find(query)
      .populate('vehicle', 'registrationNumber model')
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name');

    const summary = {
      total: maintenance.length,
      byType: maintenance.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      }, {}),
      byStatus: maintenance.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {}),
      totalCost: maintenance.reduce((sum, m) => sum + (m.actualCost || 0), 0),
      averageCost: maintenance.length ? maintenance.reduce((sum, m) => sum + (m.actualCost || 0), 0) / maintenance.length : 0
    };

    const report = await Report.create({
      title: `Maintenance Report ${new Date().toLocaleDateString()}`,
      type: 'maintenance_report',
      dateRange: {
        start: startDate || new Date(0),
        end: endDate || new Date()
      },
      filters: { vehicleId },
      data: { maintenance },
      summary,
      generatedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Generate maintenance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating report'
    });
  }
};

// @desc    Generate report (generic wrapper)
// @route   POST /api/reports/generate
// @access  Private/Admin
const generateReport = async (req, res) => {
  try {
    const { type, ...rest } = req.body;
    
    switch (type) {
      case 'activity':
        return await generateActivityReport(req, res);
      case 'request':
        return await generateRequestReport(req, res);
      case 'trip':
        return await generateTripReport(req, res);
      case 'maintenance':
        return await generateMaintenanceReport(req, res);
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating report'
    });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Admin
const getReports = async (req, res) => {
  try {
    const {
      type,
      page = 1,
      limit = 10,
      startDate,
      endDate
    } = req.query;

    const query = {};
    if (type) query.type = type;
    if (startDate || endDate) {
      query.generatedAt = {};
      if (startDate) query.generatedAt.$gte = new Date(startDate);
      if (endDate) query.generatedAt.$lte = new Date(endDate);
    }

    const reports = await Report.find(query)
      .populate('generatedBy', 'name email')
      .sort('-generatedAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports'
    });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private/Admin
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report'
    });
  }
};

// @desc    Download report
// @route   GET /api/reports/:id/download
// @access  Private/Admin
const downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Increment download count
    report.downloads += 1;
    report.lastDownloadedAt = new Date();
    await report.save();

    // Return based on format
    if (report.format === 'json') {
      res.status(200).json({
        success: true,
        report: report.data
      });
    } else if (report.fileUrl) {
      // If file is stored, serve it
      res.download(report.fileUrl);
    }

  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading report'
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting report'
    });
  }
};

// @desc    Get system logs
// @route   GET /api/logs
// @access  Private/Admin
const getSystemLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      action,
      userId
    } = req.query;

    const query = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    if (action) query.action = action;
    if (userId) query.user = userId;

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort('-timestamp')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(query);

    // Get statistics
    const stats = {
      total: await ActivityLog.countDocuments(),
      today: await ActivityLog.countDocuments({
        timestamp: {
          $gte: new Date().setHours(0, 0, 0),
          $lte: new Date().setHours(23, 59, 59)
        }
      }),
      byAction: await ActivityLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    };

    res.status(200).json({
      success: true,
      logs,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching logs'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const Vehicle = require('../models/Vehicle');
    const Request = require('../models/Request');
    const Trip = require('../models/Trip');

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const stats = {
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ isActive: true }),
        byRole: {
          admin: await User.countDocuments({ role: 'admin', isActive: true }),
          staff: await User.countDocuments({ role: 'staff', isActive: true }),
          transport: await User.countDocuments({ role: 'transport', isActive: true }),
          driver: await User.countDocuments({ role: 'driver', isActive: true })
        }
      },
      vehicles: {
        total: await Vehicle.countDocuments(),
        available: await Vehicle.countDocuments({ status: 'available' }),
        assigned: await Vehicle.countDocuments({ status: 'assigned' }),
        maintenance: await Vehicle.countDocuments({ status: 'maintenance' })
      },
      requests: {
        total: await Request.countDocuments(),
        pending: await Request.countDocuments({ status: 'pending' }),
        approved: await Request.countDocuments({ status: 'approved' }),
        completed: await Request.countDocuments({ status: 'completed' }),
        today: await Request.countDocuments({
          createdAt: { $gte: startOfDay }
        })
      },
      trips: {
        total: await Trip.countDocuments(),
        ongoing: await Trip.countDocuments({ status: 'in-progress' }),
        scheduled: await Trip.countDocuments({ status: 'scheduled' }),
        completed: await Trip.countDocuments({ status: 'completed' }),
        today: await Trip.countDocuments({
          startTime: { $gte: startOfDay }
        })
      }
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
};

// Helper functions
const calculateAvgProcessingTime = (requests) => {
  const completed = requests.filter(r => r.approvedAt && r.createdAt);
  if (completed.length === 0) return 0;
  
  const totalTime = completed.reduce((sum, r) => {
    return sum + (new Date(r.approvedAt) - new Date(r.createdAt));
  }, 0);
  
  return totalTime / completed.length / (1000 * 60 * 60); // Return in hours
};

const generateExcelReport = async (logs, summary) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Activity Logs');

  // Add title
  worksheet.mergeCells('A1:G1');
  const titleRow = worksheet.getCell('A1');
  titleRow.value = 'Activity Report';
  titleRow.font = { size: 16, bold: true };
  titleRow.alignment = { horizontal: 'center' };

  // Add summary
  worksheet.addRow([]);
  worksheet.addRow(['Summary']);
  worksheet.addRow(['Total Logs:', summary.totalLogs]);
  worksheet.addRow(['Unique Users:', summary.uniqueUsers]);

  worksheet.addRow([]);
  worksheet.addRow(['Logs']);

  // Add headers
  const headers = ['Timestamp', 'Action', 'User', 'Role', 'Description', 'Status', 'IP Address'];
  worksheet.addRow(headers).eachCell(cell => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  });

  // Add data
  logs.forEach(log => {
    worksheet.addRow([
      new Date(log.timestamp).toLocaleString(),
      log.action,
      log.user?.name || 'System',
      log.userRole,
      log.description,
      log.status,
      log.ipAddress
    ]);
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 20;
  });

  return await workbook.xlsx.writeBuffer();
};

const generatePDFReport = async (logs, summary) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Title
    doc.fontSize(20).text('Activity Report', { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary');
    doc.fontSize(12);
    doc.text(`Total Logs: ${summary.totalLogs}`);
    doc.text(`Unique Users: ${summary.uniqueUsers}`);
    doc.moveDown();

    // Actions breakdown
    doc.text('Actions:');
    Object.entries(summary.actions).forEach(([action, count]) => {
      doc.text(`  ${action}: ${count}`);
    });
    doc.moveDown();

    // Recent logs
    doc.text('Recent Logs:');
    logs.slice(0, 20).forEach(log => {
      doc.fontSize(10)
        .text(`${new Date(log.timestamp).toLocaleString()} - ${log.action} - ${log.user?.name || 'System'}`);
    });

    doc.end();
  });
};

module.exports = {
  generateActivityReport,
  generateRequestReport,
  generateTripReport,
  generateMaintenanceReport,
  generateReport,
  getReports,
  getReportById,
  downloadReport,
  deleteReport,
  getSystemLogs,
  getDashboardStats
};