const orderService = require('../src/services/OrderService');
const cartService = require('../src/services/CartService');
const budgetService = require('../src/services/BudgetService');
const db = require('../src/db/index');

describe('Budget Validation Integration', () => {
    beforeEach(() => {
        cartService.clearCart();
        // Clear existing transactions
        const transactions = db.getCollection('transactions');
        transactions.length = 0;
        // Reset budget to default
        db.setSetting('budget_cap', { cap: 500, period: 'monthly' });
    });

    test('should allow order within budget', async () => {
        // Set budget to $500
        budgetService.setBudgetCap(500);
        
        // Add items worth $50 to cart
        const item = { id: 'p1', name: 'Milk', price: 50.0 };
        cartService.addToCart(item, 1, 'amazon');

        const preview = await orderService.previewOrder();
        expect(preview.can_afford).toBe(true);
        expect(preview.budget_status.allowed).toBe(true);
    });

    test('should reject order exceeding budget', async () => {
        // Set budget to $100
        budgetService.setBudgetCap(100);
        
        // Add items worth $150 to cart (exceeds budget)
        const item = { id: 'p1', name: 'Expensive Item', price: 150.0 };
        cartService.addToCart(item, 1, 'amazon');

        const preview = await orderService.previewOrder();
        expect(preview.can_afford).toBe(false);
        expect(preview.budget_status.allowed).toBe(false);
        expect(preview.budget_status.reason).toBe('Exceeds budget cap');
    });

    test('should account for previous spending', async () => {
        // Set budget to $200
        budgetService.setBudgetCap(200);
        
        // Simulate previous spending of $150
        db.insert('transactions', {
            id: 't1',
            total_cost: 150,
            status: 'completed',
            created_at: new Date().toISOString(),
            items: []
        });

        // Try to add $100 order (total would be $250, exceeds $200)
        const item = { id: 'p1', name: 'Item', price: 100.0 };
        cartService.addToCart(item, 1, 'amazon');

        const preview = await orderService.previewOrder();
        expect(preview.can_afford).toBe(false);
    });

    test('should allow order when previous spending + new order is within budget', async () => {
        // Set budget to $200
        budgetService.setBudgetCap(200);
        
        // Simulate previous spending of $100
        db.insert('transactions', {
            id: 't1',
            total_cost: 100,
            status: 'completed',
            created_at: new Date().toISOString(),
            items: []
        });

        // Try to add $50 order (total would be $150, within $200)
        const item = { id: 'p1', name: 'Item', price: 50.0 };
        cartService.addToCart(item, 1, 'amazon');

        const preview = await orderService.previewOrder();
        expect(preview.can_afford).toBe(true);
    });

    test('should prevent order placement when budget exceeded', async () => {
        // Set budget to $100
        budgetService.setBudgetCap(100);
        
        // Add items worth $150
        const item = { id: 'p1', name: 'Expensive Item', price: 150.0 };
        cartService.addToCart(item, 1, 'amazon');

        // Try to place order - should throw error
        await expect(orderService.placeOrder()).rejects.toThrow('Budget exceeded');
    });

    test('should allow order placement when within budget', async () => {
        // Set budget to $500
        budgetService.setBudgetCap(500);
        
        // Add items worth $50
        const item = { id: 'p1', name: 'Item', price: 50.0 };
        cartService.addToCart(item, 1, 'amazon');

        // Place order - should succeed
        const result = await orderService.placeOrder();
        expect(result.success).toBe(true);
        expect(result.transactionId).toBeDefined();
    });
});
