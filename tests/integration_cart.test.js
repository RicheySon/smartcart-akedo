const cartService = require('../src/services/CartService');
const db = require('../src/db/index');

describe('CartService Integration', () => {
    beforeEach(() => {
        // Reset DB state mock or clear
        // Since db is a singleton loaded from file, we might need to be careful.
        // For unit tests we probably mocked db, but here we are doing integration 
        // with the in-memory structure of the SimpleDb class.
        // We can just find the active cart and clear it.
        const cart = cartService.getCart();
        cart.items = [];
    });

    test('should create a new cart if none exists', () => {
        const cart = cartService.getCart();
        expect(cart).toBeDefined();
        expect(cart.items).toEqual([]);
        expect(cart.status).toBe('active');
    });

    test('should add items to cart', () => {
        const item = { id: 'p1', name: 'Milk', price: 5.0, vendor: 'amazon' };
        const cart = cartService.addToCart(item, 2, 'amazon');
        expect(cart.items.length).toBe(1);
        expect(cart.items[0].quantity).toBe(2);
        expect(cart.items[0].id).toBe('p1');
    });

    test('should calculate total correctly', () => {
        const item1 = { id: 'p1', name: 'Milk', price: 5.0, vendor: 'amazon' };
        const item2 = { id: 'p2', name: 'Bread', price: 3.0, vendor: 'walmart' };
        cartService.addToCart(item1, 2, 'amazon'); // 10
        cartService.addToCart(item2, 1, 'walmart'); // 3
        const total = cartService.calculateTotal();
        expect(total).toBe(13.0);
    });

    test('should remove item from cart', () => {
        const item = { id: 'p1', name: 'Milk', price: 5.0 };
        cartService.addToCart(item, 1, 'amazon');
        cartService.removeFromCart('p1');
        const cart = cartService.getCart();
        expect(cart.items.length).toBe(0);
    });
});
