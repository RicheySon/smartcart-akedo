const inventoryService = require('../services/InventoryService');
const { validateRequest } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const addItem = asyncHandler(async (req, res) => {
  const { name, quantity, category, price, expiration_date, purchase_date, unit } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Item name is required and must be a non-empty string',
      },
    });
  }

  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Quantity must be a positive number',
      },
    });
  }

  if (!category || !['produce', 'dairy', 'meat', 'pantry', 'frozen', 'other'].includes(category)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Category is required and must be one of: produce, dairy, meat, pantry, frozen, other',
      },
    });
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Price must be a non-negative number',
      },
    });
  }

  if (expiration_date) {
    const expDate = new Date(expiration_date);
    if (isNaN(expDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid expiration_date format',
        },
      });
    }
    if (expDate <= new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Expiration date must be a future date',
        },
      });
    }
  }

  const result = inventoryService.addItem({
    name,
    quantity,
    category,
    price: price || 0,
    expiration_date: expiration_date ? new Date(expiration_date) : undefined,
    purchase_date: purchase_date ? new Date(purchase_date) : undefined,
    unit: unit || 'pieces',
  });

  res.status(201).json(result);
});

const getInventory = asyncHandler(async (req, res) => {
  const result = inventoryService.getInventory();
  res.status(200).json(result);
});

const getItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = inventoryService.getItem(id);
  res.status(200).json(result);
});

const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'At least one field must be provided for update',
      },
    });
  }

  if (updates.quantity !== undefined && (typeof updates.quantity !== 'number' || updates.quantity <= 0)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Quantity must be a positive number',
      },
    });
  }

  if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Price must be a non-negative number',
      },
    });
  }

  if (updates.category !== undefined && !['produce', 'dairy', 'meat', 'pantry', 'frozen', 'other'].includes(updates.category)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Category must be one of: produce, dairy, meat, pantry, frozen, other',
      },
    });
  }

  if (updates.expiration_date) {
    const expDate = new Date(updates.expiration_date);
    if (isNaN(expDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid expiration_date format',
        },
      });
    }
    updates.expiration_date = expDate;
  }

  const result = inventoryService.updateItem(id, updates);
  res.status(200).json(result);
});

const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = inventoryService.deleteItem(id);
  res.status(200).json(result);
});

const importReceipt = asyncHandler(async (req, res) => {
  const receiptData = req.body;

  if (!receiptData || typeof receiptData !== 'object') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Receipt data is required and must be an object',
      },
    });
  }

  if (!Array.isArray(receiptData.items)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Receipt data must contain an items array',
      },
    });
  }

  if (receiptData.items.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Receipt items array cannot be empty',
      },
    });
  }

  const result = inventoryService.importFromReceipt(receiptData);
  res.status(200).json(result);
});

const getExpiringSoon = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 2;
  if (days < 0 || days > 365) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Days parameter must be between 0 and 365',
      },
    });
  }
  const result = inventoryService.getExpiringSoon(days);
  res.status(200).json(result);
});

const getByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  if (!['produce', 'dairy', 'meat', 'pantry', 'frozen', 'other'].includes(category)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Category must be one of: produce, dairy, meat, pantry, frozen, other',
      },
    });
  }
  const result = inventoryService.getByCategory(category);
  res.status(200).json(result);
});

const getTotalValue = asyncHandler(async (req, res) => {
  const result = inventoryService.getTotalValue();
  res.status(200).json(result);
});

module.exports = {
  addItem,
  getInventory,
  getItem,
  updateItem,
  deleteItem,
  importReceipt,
  getExpiringSoon,
  getByCategory,
  getTotalValue,
};

