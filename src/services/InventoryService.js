const inventory = require('../models/Inventory');
const logger = require('../utils/logger');

class InventoryService {
  getInventory() {
    try {
      const items = inventory.list();
      logger.debug(`Retrieved ${items.length} items from inventory`);
      return {
        success: true,
        data: items,
        count: items.length,
      };
    } catch (error) {
      logger.error('Error getting inventory:', error);
      throw error;
    }
  }

  addItem(itemData) {
    try {
      const item = inventory.add(itemData);
      logger.info(`Item added successfully: ${item.id} - ${item.name}`);
      return {
        success: true,
        data: item,
        message: 'Item added successfully',
      };
    } catch (error) {
      logger.error('Error adding item:', error);
      throw error;
    }
  }

  updateItem(id, updates) {
    try {
      const item = inventory.update(id, updates);
      logger.info(`Item updated successfully: ${id}`);
      return {
        success: true,
        data: item,
        message: 'Item updated successfully',
      };
    } catch (error) {
      logger.error(`Error updating item ${id}:`, error);
      throw error;
    }
  }

  deleteItem(id) {
    try {
      const item = inventory.delete(id);
      logger.info(`Item deleted successfully: ${id}`);
      return {
        success: true,
        data: item,
        message: 'Item deleted successfully',
      };
    } catch (error) {
      logger.error(`Error deleting item ${id}:`, error);
      throw error;
    }
  }

  getItem(id) {
    try {
      const item = inventory.get(id);
      return {
        success: true,
        data: item,
      };
    } catch (error) {
      logger.error(`Error getting item ${id}:`, error);
      throw error;
    }
  }

  importFromReceipt(receiptData) {
    try {
      if (!Array.isArray(receiptData.items)) {
        throw new Error('Receipt data must contain an items array');
      }

      if (receiptData.items.length === 0) {
        throw new Error('Receipt items array cannot be empty');
      }

      const results = {
        success: true,
        added: [],
        updated: [],
        errors: [],
      };

      receiptData.items.forEach((item, index) => {
        try {
          const itemData = {
            name: item.name || item.item || item.product,
            quantity: item.quantity || 1,
            category: item.category || 'other',
            price: item.price || item.cost || 0,
            unit: item.unit || 'pieces',
            expiration_date: item.expiration_date ? new Date(item.expiration_date) : undefined,
            purchase_date: receiptData.purchase_date ? new Date(receiptData.purchase_date) : new Date(),
          };

          if (!itemData.name) {
            throw new Error('Item name is required');
          }

          const existingItem = inventory.findDuplicate(itemData.name, itemData.category);
          const result = inventory.add(itemData);

          if (existingItem) {
            results.updated.push(result);
          } else {
            results.added.push(result);
          }
        } catch (error) {
          results.errors.push({
            index,
            item: item.name || item.item || `Item ${index + 1}`,
            error: error.message,
          });
          logger.warn(`Error importing item at index ${index}:`, error.message);
        }
      });

      results.message = `Imported ${results.added.length} new items, updated ${results.updated.length} existing items`;
      if (results.errors.length > 0) {
        results.message += `, ${results.errors.length} errors`;
      }

      logger.info(`Receipt import completed: ${results.added.length} added, ${results.updated.length} updated, ${results.errors.length} errors`);
      return results;
    } catch (error) {
      logger.error('Error importing receipt:', error);
      throw error;
    }
  }

  getByCategory(category) {
    try {
      const items = inventory.getByCategory(category);
      logger.debug(`Retrieved ${items.length} items for category: ${category}`);
      return {
        success: true,
        data: items,
        count: items.length,
        category,
      };
    } catch (error) {
      logger.error(`Error getting items by category ${category}:`, error);
      throw error;
    }
  }

  getExpiringSoon(days = 2) {
    try {
      const items = inventory.getExpiringSoon(days);
      logger.debug(`Retrieved ${items.length} items expiring within ${days} days`);
      return {
        success: true,
        data: items,
        count: items.length,
        days,
      };
    } catch (error) {
      logger.error('Error getting expiring items:', error);
      throw error;
    }
  }

  getTotalValue() {
    try {
      const total = inventory.getTotalValue();
      logger.debug(`Total inventory value: $${total.toFixed(2)}`);
      return {
        success: true,
        data: {
          total_value: total,
          currency: 'USD',
        },
      };
    } catch (error) {
      logger.error('Error calculating total value:', error);
      throw error;
    }
  }
}

module.exports = new InventoryService();

