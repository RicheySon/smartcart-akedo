const auditService = require('../services/AuditService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const getAuditLog = asyncHandler(async (req, res) => {
  const filters = {
    action_type: req.query.action_type,
    entity_type: req.query.entity_type,
    entity_id: req.query.entity_id,
    user_id: req.query.user_id,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    limit: req.query.limit,
    offset: req.query.offset,
  };

  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined) {
      delete filters[key];
    }
  });

  try {
    const result = auditService.getAuditLog(filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error getting audit log:', error);
    throw error;
  }
});

const generateComplianceReport = asyncHandler(async (req, res) => {
  const dateRange = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
  };

  if (dateRange.start_date && isNaN(new Date(dateRange.start_date).getTime())) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid start_date format',
      },
    });
  }

  if (dateRange.end_date && isNaN(new Date(dateRange.end_date).getTime())) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid end_date format',
      },
    });
  }

  Object.keys(dateRange).forEach(key => {
    if (dateRange[key] === undefined) {
      delete dateRange[key];
    }
  });

  try {
    const report = auditService.generateComplianceReport(dateRange);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error generating compliance report:', error);
    throw error;
  }
});

const getAuditLogByAction = asyncHandler(async (req, res) => {
  const { action } = req.params;

  if (!action) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Action type is required',
      },
    });
  }

  try {
    const result = auditService.getAuditLogByAction(action);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error getting audit log for action ${action}:`, error);
    throw error;
  }
});

const getAuditLogByDate = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Both start_date and end_date are required',
      },
    });
  }

  if (isNaN(new Date(start_date).getTime())) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid start_date format',
      },
    });
  }

  if (isNaN(new Date(end_date).getTime())) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid end_date format',
      },
    });
  }

  try {
    const result = auditService.getAuditLogByDate(start_date, end_date);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error getting audit log by date:', error);
    throw error;
  }
});

module.exports = {
  getAuditLog,
  generateComplianceReport,
  getAuditLogByAction,
  getAuditLogByDate,
};




