const inventoryService = require('../InventoryService');
const inventory = require('../../models/Inventory');

jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('InventoryService', () => {
  beforeEach(() => {
    inventory.clear();
  });

  describe('addItem', () => {
    it('should successfully add a new item', () => {
      const itemData = {
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
        unit: 'liters',
      };

      const result = inventoryService.addItem(itemData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data.name).toBe('Milk');
      expect(result.data.quantity).toBe(2);
      expect(result.data.category).toBe('dairy');
      expect(result.message).toBe('Item added successfully');
    });

    it('should update quantity when duplicate item is added', () => {
      const itemData = {
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
      };

      inventoryService.addItem(itemData);
      const result = inventoryService.addItem({ ...itemData, quantity: 3 });

      expect(result.success).toBe(true);
      expect(result.data.quantity).toBe(5);
    });

    it('should throw error for invalid input - missing name', () => {
      const itemData = {
        quantity: 2,
        category: 'dairy',
      };

      expect(() => inventoryService.addItem(itemData)).toThrow();
    });

    it('should throw error for invalid input - negative quantity', () => {
      const itemData = {
        name: 'Milk',
        quantity: -1,
        category: 'dairy',
      };

      expect(() => inventoryService.addItem(itemData)).toThrow();
    });

    it('should throw error for invalid category', () => {
      const itemData = {
        name: 'Milk',
        quantity: 2,
        category: 'invalid',
      };

      expect(() => inventoryService.addItem(itemData)).toThrow();
    });
  });

  describe('updateItem', () => {
    it('should successfully update item quantity', () => {
      const itemData = {
        name: 'Bread',
        quantity: 1,
        category: 'pantry',
        price: 2.50,
      };

      const added = inventoryService.addItem(itemData);
      const result = inventoryService.updateItem(added.data.id, { quantity: 5 });

      expect(result.success).toBe(true);
      expect(result.data.quantity).toBe(5);
    });

    it('should successfully update expiration date', () => {
      const itemData = {
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
      };

      const added = inventoryService.addItem(itemData);
      const newExpiration = new Date();
      newExpiration.setDate(newExpiration.getDate() + 10);

      const result = inventoryService.updateItem(added.data.id, {
        expiration_date: newExpiration,
      });

      expect(result.success).toBe(true);
      expect(result.data.expiration_date).toBe(newExpiration.toISOString());
    });

    it('should throw error when updating non-existent item', () => {
      expect(() => {
        inventoryService.updateItem('invalid_id', { quantity: 5 });
      }).toThrow();
    });

    it('should throw error for invalid update data', () => {
      const itemData = {
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
      };

      const added = inventoryService.addItem(itemData);

      expect(() => {
        inventoryService.updateItem(added.data.id, { quantity: -1 });
      }).toThrow();
    });
  });

  describe('deleteItem', () => {
    it('should successfully delete an item', () => {
      const itemData = {
        name: 'Bread',
        quantity: 1,
        category: 'pantry',
      };

      const added = inventoryService.addItem(itemData);
      const result = inventoryService.deleteItem(added.data.id);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Bread');
    });

    it('should throw error when deleting non-existent item', () => {
      expect(() => {
        inventoryService.deleteItem('invalid_id');
      }).toThrow();
    });
  });

  describe('getExpiringSoon', () => {
    it('should return items expiring within specified days', () => {
      const itemData = {
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
      };

      inventoryService.addItem(itemData);
      const result = inventoryService.getExpiringSoon(7);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return empty array when no items expiring soon', () => {
      inventory.clear();
      const result = inventoryService.getExpiringSoon(2);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('importFromReceipt', () => {
    it('should successfully import items from receipt', () => {
      const receiptData = {
        purchase_date: new Date().toISOString(),
        items: [
          { name: 'Milk', quantity: 2, category: 'dairy', price: 3.99 },
          { name: 'Bread', quantity: 1, category: 'pantry', price: 2.50 },
        ],
      };

      const result = inventoryService.importFromReceipt(receiptData);

      expect(result.success).toBe(true);
      expect(result.added.length + result.updated.length).toBeGreaterThan(0);
    });

    it('should handle invalid receipt data', () => {
      const receiptData = {
        items: 'invalid',
      };

      expect(() => {
        inventoryService.importFromReceipt(receiptData);
      }).toThrow();
    });

    it('should handle empty receipt items', () => {
      const receiptData = {
        items: [],
      };

      expect(() => {
        inventoryService.importFromReceipt(receiptData);
      }).toThrow();
    });

    it('should update existing items when importing duplicates', () => {
      const itemData = {
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
      };

      inventoryService.addItem(itemData);

      const receiptData = {
        items: [
          { name: 'Milk', quantity: 3, category: 'dairy', price: 3.99 },
        ],
      };

      const result = inventoryService.importFromReceipt(receiptData);

      expect(result.success).toBe(true);
      expect(result.updated.length).toBeGreaterThan(0);
    });
  });

  describe('getByCategory', () => {
    it('should return items filtered by category', () => {
      inventoryService.addItem({
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
      });

      inventoryService.addItem({
        name: 'Bread',
        quantity: 1,
        category: 'pantry',
        price: 2.50,
      });

      const result = inventoryService.getByCategory('dairy');

      expect(result.success).toBe(true);
      expect(result.data.every(item => item.category === 'dairy')).toBe(true);
    });

    it('should return empty array for category with no items', () => {
      inventory.clear();
      const result = inventoryService.getByCategory('meat');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getTotalValue', () => {
    it('should calculate total inventory value', () => {
      inventoryService.addItem({
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        price: 3.99,
      });

      inventoryService.addItem({
        name: 'Bread',
        quantity: 1,
        category: 'pantry',
        price: 2.50,
      });

      const result = inventoryService.getTotalValue();

      expect(result.success).toBe(true);
      expect(result.data.total_value).toBeGreaterThan(0);
      expect(result.data.currency).toBe('USD');
    });

    it('should return zero for empty inventory', () => {
      inventory.clear();
      const result = inventoryService.getTotalValue();

      expect(result.success).toBe(true);
      expect(result.data.total_value).toBe(0);
    });
  });
});







