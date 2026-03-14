const ActivityLog = require('../models/ActivityLog');

// Middleware to automatically log API actions
const logActivity = (action, targetType) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    let responseBody;

    // Override send to capture response
    res.send = function(body) {
      responseBody = body;
      originalSend.call(this, body);
    };

    // Wait for response to finish
    res.on('finish', async () => {
      try {
        // Don't log if no user (except for login)
        if (!req.user && action !== 'USER_LOGIN') return;

        // Parse response if it's JSON
        let responseData;
        try {
          responseData = JSON.parse(responseBody);
        } catch {
          responseData = {};
        }

        // Create log
        await ActivityLog.create({
          action,
          user: req.user?._id,
          userRole: req.user?.role || 'system',
          targetType,
          targetId: req.params.id || req.body.id,
          description: `${action} - ${res.statusCode}`,
          details: {
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            query: req.query,
            statusCode: res.statusCode,
            success: responseData?.success
          },
          status: res.statusCode < 400 ? 'success' : 'failure',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      } catch (error) {
        console.error('Error in activity log middleware:', error);
      }
    });

    next();
  };
};

module.exports = { logActivity };