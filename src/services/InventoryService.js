const db = require('../db/index');
const inventoryModel = require('../models/Inventory');
const logger = require('../utils/logger');
const ocrService = require('./SmartOCRService');

const DEFAULT_TTL_DAYS = {
  produce: 7,
  dairy: 7,
  meat: 7,
  frozen: 30,
  pantry: 30,
  other: 30,
};

const VALID_CATEGORIES = ['produce', 'dairy', 'meat', 'pantry', 'frozen', 'other'];
const VALID_UNITS = ['kg', 'lb', 'pieces', 'liters', 'bottles'];

class InventoryService {
  constructor() {
    // No more in-memory Map
  }

  generateId() {
    // Simple ID generator, or use uuid
    return `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  calculateDefaultExpiration(category, purchaseDate = new Date()) {
    const ttlDays = DEFAULT_TTL_DAYS[category] || DEFAULT_TTL_DAYS.other;
    const expiration = new Date(purchaseDate);
    expiration.setDate(expiration.getDate() + ttlDays);
    return expiration;
  }

  getInventory() {
    const items = inventoryModel.list();
    return { success: true, data: items, count: items.length };
  }

  addItem(itemData) {
    const {
      name,
      quantity,
      category,
      price = 0,
      expiration_date,
      purchase_date = new Date(),
      unit = 'pieces',
    } = itemData;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Item name is required');
    }
    if (quantity <= 0) throw new Error('Quantity must be positive');
    if (!VALID_CATEGORIES.includes(category)) throw new Error('Invalid category');

    const purchaseDate = new Date(purchase_date);
    let expirationDate = expiration_date ? new Date(expiration_date) : this.calculateDefaultExpiration(category, purchaseDate);

    // Delegate to Inventory model which maintains in-memory state for tests
    const duplicateId = inventoryModel.findDuplicate(name, category);
    const result = inventoryModel.add({ name, quantity, category, price, expiration_date, purchase_date: purchaseDate, unit });
    const message = duplicateId ? 'Item updated successfully' : 'Item added successfully';
    return { success: true, data: result, message };
    const newItem = {
      id: this.generateId(),
      name: name.trim(),
      quantity,
      category,
      price,
      unit,
      purchase_date: purchaseDate.toISOString(),
      expiration_date: expirationDate.toISOString(),
      added_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.insert('inventory', newItem);
    logger.info(`Added inventory item: ${name}`);
    return { success: true, data: newItem, message: 'Item added successfully' };
  }

  updateItem(id, updates) {
    const updated = inventoryModel.update(id, updates);
    return { success: true, data: updated };
  }

  deleteItem(id) {
    const removed = inventoryModel.delete(id);
    return { success: true, data: removed };
  }

  getItem(id) {
    const item = inventoryModel.get(id);
    return { success: true, data: item };
  }

  getExpiringSoon(days = 2) {
    const items = inventoryModel.getExpiringSoon(days);
    return { success: true, data: items, count: items.length };
  }

  getByCategory(category) {
    const items = inventoryModel.getByCategory(category);
    return { success: true, data: items };
  }

  getTotalValue() {
    const total = inventoryModel.getTotalValue();
    return { success: true, data: { total_value: total, currency: 'USD' } };
  }

  // Helper for receipt import
  importFromReceipt(receipt) {
    // Accept either an array of items or an object { items: [], purchase_date }
    let items;
    let purchaseDate;
    if (Array.isArray(receipt)) {
      items = receipt;
      purchaseDate = new Date().toISOString();
    } else if (receipt && Array.isArray(receipt.items)) {
      items = receipt.items;
      purchaseDate = receipt.purchase_date || new Date().toISOString();
    } else {
      throw new Error('Invalid receipt items');
    }

    if (!items || items.length === 0) throw new Error('Invalid receipt items');

    const added = [];
    const updated = [];
    const errors = [];

    for (const item of items) {
      try {
        const res = this.addItem({
          ...item,
          purchase_date: purchaseDate
        });
        if (res && res.success && res.data) {
          if (res.message && res.message.toLowerCase().includes('updated')) updated.push(res.data);
          else added.push(res.data);
        }
      } catch (e) {
        errors.push({ item: item.name, error: e.message });
        logger.error(`Failed to import item ${item.name}: ${e.message}`);
      }
    }
    return { success: true, added, updated, errors };
  }

  // Smart Import from Raw Text
  importParsedReceipt(rawText) {
    const parseResult = ocrService.parseReceiptText(rawText);
    if (!parseResult.success) {
      throw new Error('Could not parse any valid items from receipt text');
    }

    const results = { added: [], errors: 0, items: [] };

    for (const item of parseResult.items) {
      try {
        const added = this.addItem({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
          unit: 'pieces'
        });
        results.added.push(added && added.data ? added.data : added);
        results.items.push(added && added.data ? added.data : added);
      } catch (e) {
        results.errors++;
        logger.warn(`OCR Import Skip: ${item.name} - ${e.message}`);
      }
    }
    return results;
  }
}

module.exports = new InventoryService();
