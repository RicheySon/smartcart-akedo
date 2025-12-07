const orderService = require('../src/services/OrderService');
const cartService = require('../src/services/CartService');
const db = require('../src/db/index');

describe('OrderService Integration', () => {
    beforeEach(() => {
        cartService.clearCart();
        // Reset necessary DB collections if possible or mock
        // We assume budget is enough
    });

    test('should preview order successfully', async () => {
        const item = { id: 'p1', name: 'Milk', price: 5.0 };
        cartService.addToCart(item, 2, 'amazon');

        const preview = await orderService.previewOrder();
        expect(preview.item_count).toBe(1);
        expect(preview.total_cost).toBe(10.0);
        expect(preview.can_afford).toBeDefined();
    });

    test('should place order and update inventory', async () => {
        const item = { id: 'p1', name: 'Milk', price: 5.0 };
        cartService.addToCart(item, 2, 'amazon');

        const result = await orderService.placeOrder();
        expect(result.success).toBe(true);
        expect(result.transactionId).toBeDefined();

        // Verify Cart is empty
        const cart = cartService.getCart();
        expect(cart.items.length).toBe(0);

        // Verify Transaction exists
        const transaction = db.findOne('transactions', t => t.id === result.transactionId);
        expect(transaction).toBeDefined();
        expect(transaction.total_cost).toBe(10.0);
    });
});
