const express = require('express');
const router = express.Router();
const orderService = require('../services/OrderService');
const logger = require('../utils/logger');

// POST /api/orders/preview
router.post('/preview', async (req, res) => {
    try {
        const preview = await orderService.previewOrder();
        res.json(preview);
    } catch (error) {
        logger.error('Error previewing order:', error);
        res.status(500).json({ error: 'Failed to preview order' });
    }
});

// POST /api/orders/checkout
router.post('/checkout', async (req, res) => {
    try {
        const result = await orderService.placeOrder();
        res.json(result);
    } catch (error) {
        logger.error('Error placing order:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
