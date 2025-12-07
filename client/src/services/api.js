const API_BASE = '/api';

export const api = {
    // Inventory
    async getInventory() {
        const res = await fetch(`${API_BASE}/inventory`);
        return res.json();
    },

    async addInventoryItem(item) {
        const res = await fetch(`${API_BASE}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        return res.json();
    },

    async updateInventoryItem(id, updates) {
        const res = await fetch(`${API_BASE}/inventory/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return res.json();
    },

    async deleteInventoryItem(id) {
        const res = await fetch(`${API_BASE}/inventory/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Forecasting
    async getShoppingList() {
        const res = await fetch(`${API_BASE}/forecast/shopping-list`);
        return res.json();
    },

    // Cart
    async getCart() {
        const res = await fetch(`${API_BASE}/cart`);
        return res.json();
    },

    async addToCart(item, quantity, vendor) {
        const res = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item, quantity, vendor })
        });
        return res.json();
    },

    async removeFromCart(itemId) {
        const res = await fetch(`${API_BASE}/cart/${itemId}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    async clearCart() {
        const res = await fetch(`${API_BASE}/cart`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Orders
    async previewOrder() {
        const res = await fetch(`${API_BASE}/orders/preview`, {
            method: 'POST'
        });
        return res.json();
    },

    async checkout() {
        const res = await fetch(`${API_BASE}/orders/checkout`, {
            method: 'POST'
        });
        return res.json();
    },

    // Shopping
    async compareProduct(itemName) {
        const res = await fetch(`${API_BASE}/shopping/compare/${encodeURIComponent(itemName)}`);
        return res.json();
    }
};
