const db = require('../db/index');
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

  async getInventory() {
    return db.getCollection('inventory');
  }

  async addItem(itemData) {
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

    // Check Duplicate
    const existing = db.findOne('inventory', i =>
      i.name.toLowerCase() === name.trim().toLowerCase() && i.category === category
    );

    if (existing) {
      const updated = db.update('inventory', i => i.id === existing.id, {
        quantity: existing.quantity + quantity,
        price, // Update price to latest
        updated_at: new Date().toISOString()
      });
      logger.info(`Updated inventory item: ${name}`);
      return updated;
    }

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
    return newItem;
  }

  async updateItem(id, updates) {
    const item = db.findOne('inventory', i => i.id === id);
    if (!item) throw new Error('Item not found');

    const updated = db.update('inventory', i => i.id === id, updates);
    logger.info(`Updated item ${id}`);
    return updated;
  }

  async deleteItem(id) {
    const removed = db.remove('inventory', i => i.id === id);
    if (!removed) throw new Error('Item not found');
    logger.info(`Deleted item ${id}`);
    return removed;
  }

  async getItem(id) {
    const item = db.findOne('inventory', i => i.id === id);
    if (!item) throw new Error('Item not found');
    return item;
  }

  async getExpiringSoon(days = 2) {
    const now = new Date();
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() + days);

    return db.find('inventory', item => {
      const exp = new Date(item.expiration_date);
      return exp >= now && exp <= threshold;
    });
  }

  async getByCategory(category) {
    return db.find('inventory', i => i.category === category);
  }

  async getTotalValue() {
    const items = await this.getInventory();
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Helper for receipt import
  async importFromReceipt(items, purchaseDate) {
    const results = { added: 0, updated: 0, errors: 0 };
    for (const item of items) {
      try {
        await this.addItem({
          ...item,
          purchase_date: purchaseDate
        });
        results.added++; // or updated, logic in addItem handles both but returns object
      } catch (e) {
        results.errors++;
        logger.error(`Failed to import item ${item.name}: ${e.message}`);
      }
    }
    return results;
  }

  // Smart Import from Raw Text
  async importParsedReceipt(rawText) {
    const parseResult = ocrService.parseReceiptText(rawText);
    if (!parseResult.success) {
      throw new Error('Could not parse any valid items from receipt text');
    }

    const results = { added: 0, errors: 0, items: [] };

    for (const item of parseResult.items) {
      try {
        const added = await this.addItem({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
          unit: 'pieces'
        });
        results.added++;
        results.items.push(added);
      } catch (e) {
        results.errors++;
        logger.warn(`OCR Import Skip: ${item.name} - ${e.message}`);
      }
    }
    return results;
  }
}

module.exports = new InventoryService();
