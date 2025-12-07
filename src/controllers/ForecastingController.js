const forecastingService = require('../services/ForecastingService');
const inventory = require('../models/Inventory');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const getShoppingList = asyncHandler(async (req, res) => {
  try {
    const inventoryItems = inventory.list();
    const shoppingList = forecastingService.generateShoppingList(inventoryItems);
    
    res.status(200).json({
      success: true,
      data: shoppingList,
    });
  } catch (error) {
    logger.error('Error generating shopping list:', error);
    throw error;
  }
});

const predictItemRunOut = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const item = inventory.get(id);
    const prediction = forecastingService.predictItemRunOut(item);
    
    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Item with id ${id} not found`,
        },
      });
    }
    logger.error(`Error predicting run-out for item ${id}:`, error);
    throw error;
  }
});

const recordUsage = asyncHandler(async (req, res) => {
  const { item_id, quantity_consumed } = req.body;

  if (!item_id) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'item_id is required',
      },
    });
  }

  if (typeof quantity_consumed !== 'number' || quantity_consumed <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'quantity_consumed must be a positive number',
      },
    });
  }

  try {
    const item = inventory.get(item_id);
    const newQuantity = Math.max(0, item.quantity - quantity_consumed);
    
    inventory.update(item_id, { quantity: newQuantity });
    
    const history = forecastingService.recordUsage(
      item.name,
      quantity_consumed,
      newQuantity
    );

    res.status(200).json({
      success: true,
      data: {
        item_id: item.id,
        item_name: item.name,
        previous_quantity: item.quantity,
        quantity_consumed,
        new_quantity: newQuantity,
        usage_history: history,
        message: 'Usage recorded successfully',
      },
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Item with id ${item_id} not found`,
        },
      });
    }
    logger.error('Error recording usage:', error);
    throw error;
  }
});

const getUsageHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const item = inventory.get(id);
    const history = forecastingService.getUsageHistory(item.name);
    
    res.status(200).json({
      success: true,
      data: {
        item_id: item.id,
        item_name: item.name,
        usage_history: history,
        history_points: history.length,
      },
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Item with id ${id} not found`,
        },
      });
    }
    logger.error(`Error getting usage history for item ${id}:`, error);
    throw error;
  }
});

const getRecommendedQuantity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetDays = parseInt(req.query.days) || 7;

  if (targetDays < 1 || targetDays > 365) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Days parameter must be between 1 and 365',
      },
    });
  }

  try {
    const item = inventory.get(id);
    const recommendation = forecastingService.getRecommendedQuantity(item, targetDays);
    
    res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Item with id ${id} not found`,
        },
      });
    }
    logger.error(`Error getting recommended quantity for item ${id}:`, error);
    throw error;
  }
});

module.exports = {
  getShoppingList,
  predictItemRunOut,
  recordUsage,
  getUsageHistory,
  getRecommendedQuantity,
};




