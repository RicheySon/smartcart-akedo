const logger = require('../utils/logger');

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

class Inventory {
  constructor() {
    this.items = new Map();
    this.nextId = 1;
  }

  generateId() {
    return `item_${this.nextId++}`;
  }

  calculateDefaultExpiration(category, purchaseDate = new Date()) {
    const ttlDays = DEFAULT_TTL_DAYS[category] || DEFAULT_TTL_DAYS.other;
    const expiration = new Date(purchaseDate);
    expiration.setDate(expiration.getDate() + ttlDays);
    return expiration;
  }

  findDuplicate(name, category) {
    for (const [id, item] of this.items.entries()) {
      if (
        item.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        item.category === category
      ) {
        return id;
      }
    }
    return null;
  }

  add(itemData) {
    const {
      name,
      quantity,
      category,
      price = 0,
      expiration_date,
      purchase_date = new Date(),
      unit = 'pieces',
    } = itemData;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Item name is required and must be a non-empty string');
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }

    if (!VALID_CATEGORIES.includes(category)) {
      throw new Error(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    if (!VALID_UNITS.includes(unit)) {
      throw new Error(`Unit must be one of: ${VALID_UNITS.join(', ')}`);
    }

    if (typeof price !== 'number' || price < 0) {
      throw new Error('Price must be a non-negative number');
    }

    const purchaseDate = purchase_date instanceof Date ? purchase_date : new Date(purchase_date);
    if (isNaN(purchaseDate.getTime())) {
      throw new Error('Invalid purchase_date');
    }

    let expirationDate;
    if (expiration_date) {
      expirationDate = expiration_date instanceof Date ? expiration_date : new Date(expiration_date);
      if (isNaN(expirationDate.getTime())) {
        throw new Error('Invalid expiration_date');
      }
      if (expirationDate <= purchaseDate) {
        throw new Error('Expiration date must be after purchase date');
      }
    } else {
      expirationDate = this.calculateDefaultExpiration(category, purchaseDate);
    }

    const duplicateId = this.findDuplicate(name, category);
    if (duplicateId) {
      const existingItem = this.items.get(duplicateId);
      existingItem.quantity += quantity;
      existingItem.price = price;
      existingItem.expiration_date = expirationDate.toISOString();
      existingItem.updated_at = new Date().toISOString();
      logger.info(`Updated duplicate item: ${name} (${category}) - New quantity: ${existingItem.quantity}`);
      return existingItem;
    }

    const id = this.generateId();
    const item = {
      id,
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

    this.items.set(id, item);
    logger.info(`Added new item: ${name} (${category}) - Quantity: ${quantity}`);
    return item;
  }

  update(id, updates) {
    if (!this.items.has(id)) {
      throw new Error(`Item with id ${id} not found`);
    }

    const item = this.items.get(id);
    const updatedItem = { ...item };

    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        throw new Error('Item name must be a non-empty string');
      }
      updatedItem.name = updates.name.trim();
    }

    if (updates.quantity !== undefined) {
      if (typeof updates.quantity !== 'number' || updates.quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }
      updatedItem.quantity = updates.quantity;
    }

    if (updates.category !== undefined) {
      if (!VALID_CATEGORIES.includes(updates.category)) {
        throw new Error(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
      }
      updatedItem.category = updates.category;
    }

    if (updates.price !== undefined) {
      if (typeof updates.price !== 'number' || updates.price < 0) {
        throw new Error('Price must be a non-negative number');
      }
      updatedItem.price = updates.price;
    }

    if (updates.unit !== undefined) {
      if (!VALID_UNITS.includes(updates.unit)) {
        throw new Error(`Unit must be one of: ${VALID_UNITS.join(', ')}`);
      }
      updatedItem.unit = updates.unit;
    }

    if (updates.expiration_date !== undefined) {
      const expirationDate = updates.expiration_date instanceof Date
        ? updates.expiration_date
        : new Date(updates.expiration_date);
      if (isNaN(expirationDate.getTime())) {
        throw new Error('Invalid expiration_date');
      }
      const purchaseDate = new Date(updatedItem.purchase_date);
      if (expirationDate <= purchaseDate) {
        throw new Error('Expiration date must be after purchase date');
      }
      updatedItem.expiration_date = expirationDate.toISOString();
    }

    updatedItem.updated_at = new Date().toISOString();
    this.items.set(id, updatedItem);
    logger.info(`Updated item: ${id} - ${updatedItem.name}`);
    return updatedItem;
  }

  delete(id) {
    if (!this.items.has(id)) {
      throw new Error(`Item with id ${id} not found`);
    }
    const item = this.items.get(id);
    this.items.delete(id);
    logger.info(`Deleted item: ${id} - ${item.name}`);
    return item;
  }

  get(id) {
    if (!this.items.has(id)) {
      throw new Error(`Item with id ${id} not found`);
    }
    return this.items.get(id);
  }

  list() {
    return Array.from(this.items.values());
  }

  getByCategory(category) {
    if (!VALID_CATEGORIES.includes(category)) {
      throw new Error(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
    return this.list().filter(item => item.category === category);
  }

  getExpiringSoon(days = 2) {
    const now = new Date();
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() + days);

    return this.list().filter(item => {
      const expiration = new Date(item.expiration_date);
      return expiration <= threshold && expiration >= now;
    });
  }

  getTotalValue() {
    return this.list().reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  clear() {
    this.items.clear();
    this.nextId = 1;
    logger.info('Inventory cleared');
  }
}

module.exports = new Inventory();







