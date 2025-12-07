const db = require('../db/index');
const logger = require('../utils/logger');

class AuditService {
  constructor() {
    // No more memory map
  }

  logAction(actionType, entityType, entityId, changes, userId = 'system') {
    const entry = {
      id: Date.now(), // simple id
      action: actionType,
      entity_type: entityType,
      entity_id: entityId,
      changes: changes,
      user_id: userId,
      timestamp: new Date().toISOString()
    };

    try {
      db.insert('audit_logs', entry);
      logger.debug(`Audit: ${actionType} on ${entityType} ${entityId}`);
    } catch (err) {
      logger.error('Failed to log audit entry', err);
    }
  }

  getAuditLog(filters = {}) {
    let logs = db.getCollection('audit_logs');

    if (filters.action_type) {
      logs = logs.filter(l => l.action === filters.action_type);
    }
    if (filters.entity_type) {
      logs = logs.filter(l => l.entity_type === filters.entity_type);
    }
    // ... other filters

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

module.exports = new AuditService();

