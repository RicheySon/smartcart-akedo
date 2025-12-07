const express = require('express');
const router = express.Router();
const {
  getAuditLog,
  generateComplianceReport,
  getAuditLogByAction,
  getAuditLogByDate,
} = require('../controllers/AuditController');

router.get('/log', getAuditLog);

router.get('/report', generateComplianceReport);

router.get('/by-action/:action', getAuditLogByAction);

router.get('/by-date', getAuditLogByDate);

module.exports = router;


