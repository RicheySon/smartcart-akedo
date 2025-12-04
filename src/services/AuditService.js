const logger = require('../utils/logger');

const ACTION_TYPES = [
  'ITEM_ADDED',
  'ITEM_REMOVED',
  'ITEM_UPDATED',
  'PURCHASE_APPROVED',
  'PURCHASE_REJECTED',
  'TRANSACTION_CREATED',
  'TRANSACTION_COMPLETED',
  'TRANSACTION_RECORDED',
  'BUDGET_CHANGED',
  'BUDGET_EXCEEDED',
  'VENDOR_BLOCKED',
  'VENDOR_ALLOWED',
  'INVENTORY_IMPORTED',
  'USAGE_RECORDED',
];

const ENTITY_TYPES = [
  'transaction',
  'inventory',
  'item',
  'budget',
  'vendor',
  'forecast',
];

class AuditService {
  constructor() {
    this.auditLogs = [];
    this.maxLogs = 10000;
  }

  logAction(actionType, entityType, entityId, changes = {}, userId = null) {
    if (!ACTION_TYPES.includes(actionType)) {
      logger.warn(`Unknown action type: ${actionType}`);
    }

    if (!ENTITY_TYPES.includes(entityType)) {
      logger.warn(`Unknown entity type: ${entityType}`);
    }

    const auditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      changes: changes,
      user_id: userId,
      timestamp: new Date().toISOString(),
      ip_address: null,
      user_agent: null,
    };

    this.auditLogs.unshift(auditEntry);

    if (this.auditLogs.length > this.maxLogs) {
      this.auditLogs = this.auditLogs.slice(0, this.maxLogs);
    }

    logger.debug(`Audit log: ${actionType} on ${entityType} ${entityId} by user ${userId || 'system'}`);
    return auditEntry;
  }

  getAuditLog(filters = {}) {
    let logs = [...this.auditLogs];

    if (filters.action_type) {
      logs = logs.filter(log => log.action_type === filters.action_type);
    }

    if (filters.entity_type) {
      logs = logs.filter(log => log.entity_type === filters.entity_type);
    }

    if (filters.entity_id) {
      logs = logs.filter(log => log.entity_id === filters.entity_id);
    }

    if (filters.user_id) {
      logs = logs.filter(log => log.user_id === filters.user_id);
    }

    if (filters.start_date) {
      const startDate = new Date(filters.start_date);
      logs = logs.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (filters.end_date) {
      const endDate = new Date(filters.end_date);
      logs = logs.filter(log => new Date(log.timestamp) <= endDate);
    }

    if (filters.limit) {
      logs = logs.slice(0, parseInt(filters.limit));
    }

    if (filters.offset) {
      logs = logs.slice(parseInt(filters.offset));
    }

    return {
      logs,
      total: logs.length,
      filters_applied: filters,
    };
  }

  generateComplianceReport(dateRange = {}) {
    const startDate = dateRange.start_date ? new Date(dateRange.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange.end_date ? new Date(dateRange.end_date) : new Date();

    const logs = this.auditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });

    const actionCounts = {};
    const entityCounts = {};
    const userActivity = {};
    const dailyActivity = {};

    logs.forEach(log => {
      actionCounts[log.action_type] = (actionCounts[log.action_type] || 0) + 1;
      entityCounts[log.entity_type] = (entityCounts[log.entity_type] || 0) + 1;

      if (log.user_id) {
        userActivity[log.user_id] = (userActivity[log.user_id] || 0) + 1;
      }

      const date = log.timestamp.split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    const topActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));

    const topEntities = Object.entries(entityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([entity, count]) => ({ entity, count }));

    const topUsers = Object.entries(userActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([user, count]) => ({ user_id: user, activity_count: count }));

    return {
      report_id: `compliance_${Date.now()}`,
      generated_at: new Date().toISOString(),
      date_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary: {
        total_actions: logs.length,
        unique_actions: Object.keys(actionCounts).length,
        unique_entities: Object.keys(entityCounts).length,
        unique_users: Object.keys(userActivity).length,
      },
      statistics: {
        action_breakdown: actionCounts,
        entity_breakdown: entityCounts,
        top_actions: topActions,
        top_entities: topEntities,
        top_users: topUsers,
        daily_activity: dailyActivity,
      },
      compliance_checks: {
        all_actions_logged: logs.length > 0,
        user_tracking_enabled: Object.keys(userActivity).length > 0,
        timestamp_accuracy: logs.every(log => log.timestamp),
      },
    };
  }

  getAuditLogByAction(actionType) {
    return this.getAuditLog({ action_type: actionType });
  }

  getAuditLogByDate(startDate, endDate) {
    return this.getAuditLog({
      start_date: startDate,
      end_date: endDate,
    });
  }

  getAuditLogByEntity(entityType, entityId) {
    return this.getAuditLog({
      entity_type: entityType,
      entity_id: entityId,
    });
  }

  clearAuditLogs(olderThanDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const initialCount = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(log => new Date(log.timestamp) >= cutoffDate);
    const removedCount = initialCount - this.auditLogs.length;

    logger.info(`Cleared ${removedCount} audit logs older than ${olderThanDays} days`);
    return {
      removed: removedCount,
      remaining: this.auditLogs.length,
    };
  }
}

module.exports = new AuditService();

