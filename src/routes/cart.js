const express = require('express');
const router = express.Router();
const cartService = require('../services/CartService');
const logger = require('../utils/logger');

// GET /api/cart
router.get('/', (req, res) => {
    try {
        const cart = cartService.getCart();
        const total = cartService.calculateTotal();
        res.json({ ...cart, total });
    } catch (error) {
        logger.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// POST /api/cart/add
router.post('/add', (req, res) => {
    try {
        const { item, quantity, vendor } = req.body;
        if (!item || !item.id) {
            return res.status(400).json({ error: 'Invalid item data' });
        }
        const cart = cartService.addToCart(item, quantity || 1, vendor || 'unknown');
        res.json(cart);
    } catch (error) {
        logger.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// DELETE /api/cart/:id
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const cart = cartService.removeFromCart(id);
        res.json(cart);
    } catch (error) {
        logger.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

// DELETE /api/cart
router.delete('/', (req, res) => {
    try {
        const cart = cartService.clearCart();
        res.json(cart);
    } catch (error) {
        logger.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;
