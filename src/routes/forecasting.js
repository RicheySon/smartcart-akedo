const express = require('express');
const router = express.Router();
const {
  getShoppingList,
  predictItemRunOut,
  recordUsage,
  getUsageHistory,
  getRecommendedQuantity,
} = require('../controllers/ForecastingController');

router.get('/shopping-list', getShoppingList);

router.get('/item/:id', predictItemRunOut);

router.post('/record-usage', recordUsage);

router.get('/usage-history/:id', getUsageHistory);

router.get('/recommended-quantity/:id', getRecommendedQuantity);

module.exports = router;







