const logger = require('../utils/logger');
const auditService = require('./AuditService');

class TransactionService {
  constructor() {
    this.transactions = new Map();
    this.nextId = 1;
  }

  generateId() {
    return `txn_${this.nextId++}`;
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

      if (item.unit_price > 100) {
        warnings.push(`Price spike detected for ${item.name}: $${item.unit_price}`);
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    });

    if (transaction.total_cost && transaction.budget_limit) {
      const budgetPercentage = (transaction.total_cost / transaction.budget_limit) * 100;
      if (budgetPercentage > 100) {
        warnings.push('Over budget');
        riskLevel = 'high';
      } else if (budgetPercentage > 80) {
        warnings.push('Approaching budget limit');
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    }

    return {
      level: riskLevel,
      warnings: warnings.length > 0 ? warnings : ['No issues detected'],
      score: riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 2 : 1,
    };
  }

  createPendingTransaction(cartItems, totalCost, vendor, userId = null, budgetLimit = null) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error('Cart items must be a non-empty array');
    }

    if (typeof totalCost !== 'number' || totalCost < 0) {
      throw new Error('Total cost must be a non-negative number');
    }

    if (!vendor || typeof vendor !== 'string') {
      throw new Error('Vendor is required and must be a string');
    }

    const id = this.generateId();
    const transaction = {
      id,
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.price || 0,
        category: item.category || 'other',
      })),
      total_cost: totalCost,
      vendor: vendor.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
      approved_at: null,
      approved_by: null,
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null,
      user_id: userId,
      budget_limit: budgetLimit,
      risk_assessment: null,
      audit_trail: [],
    };

    transaction.risk_assessment = this.assessRisk(transaction);
    this.transactions.set(id, transaction);

    auditService.logAction(
      'TRANSACTION_CREATED',
      'transaction',
      id,
      { status: 'pending', total_cost: totalCost, vendor },
      userId
    );

    logger.info(`Created pending transaction ${id} for vendor ${vendor} - Total: $${totalCost}`);
    return transaction;
  }

  approvePendingTransaction(transactionId, userId, reason = null) {
    if (!this.transactions.has(transactionId)) {
      throw new Error(`Transaction with id ${transactionId} not found`);
    }

    const transaction = this.transactions.get(transactionId);

    if (transaction.status !== 'pending') {
      throw new Error(`Transaction ${transactionId} is not pending (current status: ${transaction.status})`);
    }

    transaction.status = 'approved';
    transaction.approved_at = new Date().toISOString();
    transaction.approved_by = userId;
    transaction.approval_reason = reason;

    auditService.logAction(
      'PURCHASE_APPROVED',
      'transaction',
      transactionId,
      { approved_by: userId, reason },
      userId
    );

    transaction.audit_trail.push({
      action: 'APPROVED',
      timestamp: transaction.approved_at,
      user_id: userId,
      reason,
    });

    this.transactions.set(transactionId, transaction);
    logger.info(`Transaction ${transactionId} approved by user ${userId}`);

    return transaction;
  }

  rejectPendingTransaction(transactionId, reason, userId) {
    if (!this.transactions.has(transactionId)) {
      throw new Error(`Transaction with id ${transactionId} not found`);
    }

    const transaction = this.transactions.get(transactionId);

    if (transaction.status !== 'pending') {
      throw new Error(`Transaction ${transactionId} is not pending (current status: ${transaction.status})`);
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    transaction.status = 'rejected';
    transaction.rejected_at = new Date().toISOString();
    transaction.rejected_by = userId;
    transaction.rejection_reason = reason.trim();

    auditService.logAction(
      'PURCHASE_REJECTED',
      'transaction',
      transactionId,
      { rejected_by: userId, reason },
      userId
    );

    transaction.audit_trail.push({
      action: 'REJECTED',
      timestamp: transaction.rejected_at,
      user_id: userId,
      reason,
    });

    this.transactions.set(transactionId, transaction);
    logger.info(`Transaction ${transactionId} rejected by user ${userId}: ${reason}`);

    return transaction;
  }

  completeTransaction(transactionId) {
    if (!this.transactions.has(transactionId)) {
      throw new Error(`Transaction with id ${transactionId} not found`);
    }

    const transaction = this.transactions.get(transactionId);

    if (transaction.status !== 'approved') {
      throw new Error(`Transaction ${transactionId} must be approved before completion`);
    }

    transaction.status = 'completed';
    transaction.completed_at = new Date().toISOString();

    auditService.logAction(
      'TRANSACTION_COMPLETED',
      'transaction',
      transactionId,
      { completed_at: transaction.completed_at },
      transaction.approved_by
    );

    transaction.audit_trail.push({
      action: 'COMPLETED',
      timestamp: transaction.completed_at,
    });

    this.transactions.set(transactionId, transaction);
    logger.info(`Transaction ${transactionId} completed`);

    return transaction;
  }

  getPendingTransactions() {
    return Array.from(this.transactions.values())
      .filter(txn => txn.status === 'pending')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  getTransactionHistory(limit = 50, offset = 0) {
    const allTransactions = Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      transactions: allTransactions.slice(offset, offset + limit),
      total: allTransactions.length,
      limit,
      offset,
    };
  }

  getTransaction(id) {
    if (!this.transactions.has(id)) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    return this.transactions.get(id);
  }

  recordTransaction(transactionDetails) {
    const {
      items,
      total_cost,
      vendor,
      user_id,
      status = 'completed',
    } = transactionDetails;

    const id = this.generateId();
    const transaction = {
      id,
      items: items || [],
      total_cost: total_cost || 0,
      vendor: vendor || 'unknown',
      status,
      created_at: new Date().toISOString(),
      approved_at: status === 'completed' ? new Date().toISOString() : null,
      approved_by: user_id,
      user_id,
      risk_assessment: this.assessRisk({ items, total_cost, vendor }),
      audit_trail: [],
    };

    this.transactions.set(id, transaction);

    auditService.logAction(
      'TRANSACTION_RECORDED',
      'transaction',
      id,
      { total_cost, vendor, status },
      user_id
    );

    logger.info(`Recorded transaction ${id} - Total: $${total_cost}`);
    return transaction;
  }

  previewTransaction(cartItems, totalCost, vendor, budgetLimit = null) {
    const tempTransaction = {
      items: cartItems,
      total_cost: totalCost,
      vendor,
      budget_limit: budgetLimit,
    };

    const riskAssessment = this.assessRisk(tempTransaction);

    return {
      preview: {
        items: cartItems,
        total_cost: totalCost,
        vendor,
        item_count: cartItems.length,
      },
      risk_assessment: riskAssessment,
      recommendations: this.generateRecommendations(riskAssessment),
    };
  }

  generateRecommendations(riskAssessment) {
    const recommendations = [];

    if (riskAssessment.level === 'high') {
      recommendations.push('Review transaction carefully before approval');
      recommendations.push('Consider splitting into smaller transactions');
    }

    if (riskAssessment.warnings.some(w => w.includes('Over budget'))) {
      recommendations.push('This purchase will exceed your budget limit');
      recommendations.push('Consider reducing quantity or removing items');
    }

    if (riskAssessment.warnings.some(w => w.includes('Vendor blocked'))) {
      recommendations.push('This vendor is not in your allowlist');
      recommendations.push('Add vendor to allowlist or choose alternative vendor');
    }

    if (riskAssessment.warnings.some(w => w.includes('Unusual quantity'))) {
      recommendations.push('Verify quantity is correct');
    }

    if (riskAssessment.warnings.some(w => w.includes('Price spike'))) {
      recommendations.push('Price appears higher than usual');
      recommendations.push('Compare with other vendors');
    }

    return recommendations.length > 0 ? recommendations : ['Transaction looks good'];
  }
}

module.exports = new TransactionService();

