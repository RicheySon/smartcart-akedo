const db = require('../db/index');
const auditService = require('./AuditService');
const logger = require('../utils/logger');

class TransactionService {
  constructor() {
    // No more Map
  }

  generateId() {
    return `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  assessRisk(transaction) {
    const warnings = [];
    let riskLevel = 'low';

    if (transaction.total_cost > 500) {
      warnings.push('High transaction amount');
      riskLevel = 'medium';
    }
    if (transaction.total_cost > 1000) {
      riskLevel = 'high';
    }
    if (transaction.vendor && transaction.vendor.toLowerCase().includes('blocked')) {
      warnings.push('Vendor blocked');
      riskLevel = 'high';
    }
    transaction.items.forEach(item => {
      if (item.quantity > 50) {
        warnings.push(`Unusual quantity for ${item.name}: ${item.quantity}`);
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    });

    // Simple Budget Check (Mock)
    if (transaction.budget_limit && transaction.total_cost > transaction.budget_limit) {
      warnings.push('Over budget');
      riskLevel = 'high';
    }

    return {
      level: riskLevel,
      warnings: warnings.length > 0 ? warnings : ['No issues detected'],
      score: riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 2 : 1,
    };
  }

  createPendingTransaction(cartItems, totalCost, vendor, userId = null, budgetLimit = null) {
    const id = this.generateId();
    const transaction = {
      id,
      items_json: JSON.stringify(cartItems), // SimpleDb handles objects, but schema was SQL. For JSON DB we can store object directly.
      items: cartItems,
      total_cost: totalCost,
      vendor: vendor.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
      user_id: userId,
      budget_limit: budgetLimit,
      audit_trail: [],
    };

    transaction.risk_assessment = this.assessRisk(transaction);

    db.insert('transactions', transaction);

    auditService.logAction(
      'TRANSACTION_CREATED',
      'transaction',
      id,
      { status: 'pending', total_cost: totalCost, vendor },
      userId
    );

    logger.info(`Created pending transaction ${id}`);
    return transaction;
  }

  approvePendingTransaction(transactionId, userId, reason = null) {
    const transaction = db.findOne('transactions', t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');
    if (transaction.status !== 'pending') throw new Error('Transaction not pending');

    const updates = {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: userId,
      approval_reason: reason,
      audit_trail: [...(transaction.audit_trail || []), {
        action: 'APPROVED',
        timestamp: new Date().toISOString(),
        user_id: userId,
        reason
      }]
    };

    const updated = db.update('transactions', t => t.id === transactionId, updates);

    auditService.logAction(
      'PURCHASE_APPROVED',
      'transaction',
      transactionId,
      { approved_by: userId, reason },
      userId
    );

    return updated;
  }

  rejectPendingTransaction(transactionId, reason, userId) {
    const transaction = db.findOne('transactions', t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');
    if (transaction.status !== 'pending') throw new Error('Transaction not pending');

    const updates = {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: userId,
      rejection_reason: reason,
      audit_trail: [...(transaction.audit_trail || []), {
        action: 'REJECTED',
        timestamp: new Date().toISOString(),
        user_id: userId,
        reason
      }]
    };

    const updated = db.update('transactions', t => t.id === transactionId, updates);

    auditService.logAction(
      'PURCHASE_REJECTED',
      'transaction',
      transactionId,
      { rejected_by: userId, reason },
      userId
    );

    return updated;
  }

  getPendingTransactions() {
    // db.find returns array
    return db.find('transactions', t => t.status === 'pending');
  }

  getTransactionHistory(limit = 50, offset = 0) {
    const all = db.getCollection('transactions')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      transactions: all.slice(offset, offset + limit),
      total: all.length,
      limit,
      offset
    };
  }

  getTransaction(id) {
    const t = db.findOne('transactions', t => t.id === id);
    if (!t) throw new Error('Transaction not found');
    return t;
  }
}

module.exports = new TransactionService();






