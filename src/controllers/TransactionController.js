const transactionService = require('../services/TransactionService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const previewTransaction = asyncHandler(async (req, res) => {
  const { items, total_cost, vendor, budget_limit } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Items must be a non-empty array',
      },
    });
  }

  if (typeof total_cost !== 'number' || total_cost < 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Total cost must be a non-negative number',
      },
    });
  }

  if (!vendor || typeof vendor !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Vendor is required and must be a string',
      },
    });
  }

  try {
    const preview = transactionService.previewTransaction(
      items,
      total_cost,
      vendor,
      budget_limit
    );

    res.status(200).json({
      success: true,
      data: preview,
    });
  } catch (error) {
    logger.error('Error previewing transaction:', error);
    throw error;
  }
});

const createTransaction = asyncHandler(async (req, res) => {
  const { items, total_cost, vendor, user_id, budget_limit } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Items must be a non-empty array',
      },
    });
  }

  if (typeof total_cost !== 'number' || total_cost < 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Total cost must be a non-negative number',
      },
    });
  }

  if (!vendor || typeof vendor !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Vendor is required and must be a string',
      },
    });
  }

  try {
    const transaction = transactionService.createPendingTransaction(
      items,
      total_cost,
      vendor,
      user_id,
      budget_limit
    );

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Pending transaction created successfully',
    });
  } catch (error) {
    logger.error('Error creating transaction:', error);
    throw error;
  }
});

const approveTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user_id, reason } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'user_id is required for approval',
      },
    });
  }

  try {
    const transaction = transactionService.approvePendingTransaction(id, user_id, reason);

    res.status(200).json({
      success: true,
      data: transaction,
      message: 'Transaction approved successfully',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
        },
      });
    }
    if (error.message.includes('not pending')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
        },
      });
    }
    logger.error(`Error approving transaction ${id}:`, error);
    throw error;
  }
});

const rejectTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user_id, reason } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'user_id is required for rejection',
      },
    });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Rejection reason is required',
      },
    });
  }

  try {
    const transaction = transactionService.rejectPendingTransaction(id, reason, user_id);

    res.status(200).json({
      success: true,
      data: transaction,
      message: 'Transaction rejected successfully',
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          message: error.message,
        },
      });
    }
    if (error.message.includes('not pending')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
        },
      });
    }
    logger.error(`Error rejecting transaction ${id}:`, error);
    throw error;
  }
});

const getPendingTransactions = asyncHandler(async (req, res) => {
  try {
    const pending = transactionService.getPendingTransactions();

    res.status(200).json({
      success: true,
      data: {
        transactions: pending,
        count: pending.length,
      },
    });
  } catch (error) {
    logger.error('Error getting pending transactions:', error);
    throw error;
  }
});

const getTransactionHistory = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  if (limit < 1 || limit > 1000) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Limit must be between 1 and 1000',
      },
    });
  }

  if (offset < 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Offset must be non-negative',
      },
    });
  }

  try {
    const history = transactionService.getTransactionHistory(limit, offset);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error('Error getting transaction history:', error);
    throw error;
  }
});

const getTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = transactionService.getTransaction(id);

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Transaction with id ${id} not found`,
        },
      });
    }
    logger.error(`Error getting transaction ${id}:`, error);
    throw error;
  }
});

module.exports = {
  previewTransaction,
  createTransaction,
  approveTransaction,
  rejectTransaction,
  getPendingTransactions,
  getTransactionHistory,
  getTransaction,
};




