const db = require('../db/index');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class CartService {
    constructor() {
        this.collection = 'carts';
    }

    // Get the active cart or create a new one if none exists
    getCart() {
        // For MVP, we assume a single 'active' cart for the user.
        // In a multi-user system, we'd filter by userId.
        let cart = db.findOne(this.collection, c => c.status === 'active');

        if (!cart) {
            cart = {
                id: uuidv4(),
                items: [],
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            db.insert(this.collection, cart);
            logger.info(`Created new active cart: ${cart.id}`);
        }
        return cart;
    }

    addToCart(item, quantity = 1, vendor) {
        const cart = this.getCart();
        const existingItemIndex = cart.items.findIndex(i => i.id === item.id && i.vendor === vendor);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: quantity,
                vendor: vendor,
                image: item.image || ''
            });
        }

        this._updateCart(cart);
        return cart;
    }

    removeFromCart(itemId) {
        const cart = this.getCart();
        cart.items = cart.items.filter(i => i.id !== itemId);
        this._updateCart(cart);
        return cart;
    }

    clearCart() {
        const cart = this.getCart();
        cart.items = [];
        this._updateCart(cart);
        return cart;
    }

    calculateTotal() {
        const cart = this.getCart();
        return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    _updateCart(cart) {
        db.update(this.collection, c => c.id === cart.id, {
            items: cart.items,
            updated_at: new Date().toISOString()
        });
    }
}

module.exports = new CartService();
