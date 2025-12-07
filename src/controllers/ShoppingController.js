const comparisonService = require('../services/ComparisonService');
const amazonService = require('../services/AmazonService');
const walmartService = require('../services/WalmartService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const searchAcrossVendors = asyncHandler(async (req, res) => {
  const { query, limit } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Query parameter is required',
      },
    });
  }

  try {
    const searchLimit = parseInt(limit) || 5;
    const results = await comparisonService.searchAcrossVendors(query, searchLimit);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error('Error searching across vendors:', error);
    throw error;
  }
});

const comparePrices = asyncHandler(async (req, res) => {
  const { item } = req.params;

  if (!item) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Item name is required',
      },
    });
  }

  try {
    const comparison = await comparisonService.comparePrices(item);

    res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    logger.error(`Error comparing prices for ${item}:`, error);
    throw error;
  }
});

const searchAmazon = asyncHandler(async (req, res) => {
  const { query, limit } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Query parameter is required',
      },
    });
  }

  try {
    const searchLimit = parseInt(limit) || 5;
    const results = amazonService.searchProducts(query, searchLimit);

    res.status(200).json({
      success: true,
      data: {
        vendor: 'amazon',
        query,
        results,
        count: results.length,
      },
    });
  } catch (error) {
    logger.error('Error searching Amazon:', error);
    throw error;
  }
});

const searchWalmart = asyncHandler(async (req, res) => {
  const { query, limit } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Query parameter is required',
      },
    });
  }

  try {
    const searchLimit = parseInt(limit) || 5;
    const results = walmartService.searchProducts(query, searchLimit);

    res.status(200).json({
      success: true,
      data: {
        vendor: 'walmart',
        query,
        results,
        count: results.length,
      },
    });
  } catch (error) {
    logger.error('Error searching Walmart:', error);
    throw error;
  }
});

const getAmazonProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = amazonService.getProductDetails(id);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Amazon product with id ${id} not found`,
        },
      });
    }
    logger.error(`Error getting Amazon product ${id}:`, error);
    throw error;
  }
});

const getWalmartProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = walmartService.getProductDetails(id);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Walmart product with id ${id} not found`,
        },
      });
    }
    logger.error(`Error getting Walmart product ${id}:`, error);
    throw error;
  }
});

const buildOptimalCart = asyncHandler(async (req, res) => {
  const { items, budget } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Items must be a non-empty array',
      },
    });
  }

  if (budget !== undefined && (typeof budget !== 'number' || budget < 0)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Budget must be a non-negative number',
      },
    });
  }

  try {
    const cart = await comparisonService.buildOptimalCart(items, budget);

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    logger.error('Error building optimal cart:', error);
    throw error;
  }
});

module.exports = {
  searchAcrossVendors,
  comparePrices,
  searchAmazon,
  searchWalmart,
  getAmazonProduct,
  getWalmartProduct,
  buildOptimalCart,
};




