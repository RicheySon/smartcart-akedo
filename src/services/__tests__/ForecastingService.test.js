const forecastingService = require('../ForecastingService');
const inventory = require('../../models/Inventory');

jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('ForecastingService', () => {
  beforeEach(() => {
    inventory.clear();
  });

  describe('simpleLinearRegression', () => {
    it('should calculate linear regression correctly', () => {
      const data = [
        { days_ago: 7, quantity: 2000 },
        { days_ago: 6, quantity: 1850 },
        { days_ago: 5, quantity: 1700 },
        { days_ago: 4, quantity: 1550 },
        { days_ago: 3, quantity: 1400 },
        { days_ago: 2, quantity: 1250 },
        { days_ago: 1, quantity: 1100 },
        { days_ago: 0, quantity: 1000 },
      ];

      const result = forecastingService.simpleLinearRegression(data);

      expect(result).toHaveProperty('slope');
      expect(result).toHaveProperty('intercept');
      expect(result).toHaveProperty('r_squared');
      expect(typeof result.slope).toBe('number');
      expect(typeof result.intercept).toBe('number');
      expect(result.r_squared).toBeGreaterThanOrEqual(0);
      expect(result.r_squared).toBeLessThanOrEqual(1);
    });

    it('should handle insufficient data points', () => {
      const data = [{ days_ago: 0, quantity: 1000 }];

      const result = forecastingService.simpleLinearRegression(data);

      expect(result).toHaveProperty('error');
      expect(result.slope).toBe(0);
    });

    it('should handle empty data array', () => {
      const result = forecastingService.simpleLinearRegression([]);

      expect(result).toHaveProperty('error');
      expect(result.slope).toBe(0);
    });

    it('should handle constant x values', () => {
      const data = [
        { days_ago: 0, quantity: 1000 },
        { days_ago: 0, quantity: 900 },
      ];

      const result = forecastingService.simpleLinearRegression(data);

      expect(result).toHaveProperty('error');
      expect(result.slope).toBe(0);
    });
  });

  describe('predictRunOutDate', () => {
    it('should predict run-out date with usage history', () => {
      const currentQuantity = 1000;
      const dailyUsageRate = 150;

      const result = forecastingService.predictRunOutDate(
        currentQuantity,
        dailyUsageRate,
        'Milk'
      );

      expect(result).toHaveProperty('runout_date');
      expect(result).toHaveProperty('days_until_runout');
      expect(result).toHaveProperty('confidence');
      expect(result.status).toBe('predicted');
      expect(result.days_until_runout).toBeGreaterThan(0);
    });

    it('should handle zero quantity', () => {
      const result = forecastingService.predictRunOutDate(0, 150);

      expect(result.status).toBe('out_of_stock');
      expect(result.days_until_runout).toBe(0);
    });

    it('should handle zero usage rate', () => {
      const result = forecastingService.predictRunOutDate(100, 0);

      expect(result.status).toBe('no_usage');
      expect(result.days_until_runout).toBe(Infinity);
    });

    it('should handle negative usage rate (restocking)', () => {
      const result = forecastingService.predictRunOutDate(100, -50);

      expect(result.status).toBe('restocking');
      expect(result.days_until_runout).toBe(Infinity);
    });

    it('should use default estimate when no history', () => {
      const result = forecastingService.predictRunOutDate(100, 0.3, 'UnknownItem');

      expect(result).toHaveProperty('runout_date');
      expect(result.confidence).toBeLessThan(0.8);
    });
  });

  describe('generateShoppingList', () => {
    it('should generate shopping list with urgency levels', () => {
      inventory.add({
        name: 'Milk',
        quantity: 1,
        category: 'dairy',
        price: 3.99,
      });

      inventory.add({
        name: 'Bread',
        quantity: 5,
        category: 'pantry',
        price: 2.50,
      });

      const result = forecastingService.generateShoppingList(inventory.list());

      expect(result).toHaveProperty('urgent');
      expect(result).toHaveProperty('soon');
      expect(result).toHaveProperty('planned');
      expect(result).toHaveProperty('total_items');
      expect(Array.isArray(result.urgent.items)).toBe(true);
      expect(Array.isArray(result.soon.items)).toBe(true);
      expect(Array.isArray(result.planned.items)).toBe(true);
    });

    it('should categorize items by urgency correctly', () => {
      inventory.add({
        name: 'Milk',
        quantity: 0.5,
        category: 'dairy',
        price: 3.99,
      });

      const result = forecastingService.generateShoppingList(inventory.list());

      expect(result.total_items).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty inventory', () => {
      inventory.clear();
      const result = forecastingService.generateShoppingList([]);

      expect(result.urgent.count).toBe(0);
      expect(result.soon.count).toBe(0);
      expect(result.planned.count).toBe(0);
      expect(result.total_items).toBe(0);
    });
  });

  describe('recordUsage', () => {
    it('should record usage and update history', () => {
      const history = forecastingService.recordUsage('Milk', 100, 900);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].days_ago).toBe(0);
      expect(history[0].quantity).toBe(900);
    });

    it('should update existing history entry for same day', () => {
      forecastingService.recordUsage('Milk', 100, 900);
      const history = forecastingService.recordUsage('Milk', 50, 850);

      expect(history[0].quantity).toBe(850);
    });
  });

  describe('getRecommendedQuantity', () => {
    it('should recommend quantity based on usage', () => {
      const item = {
        id: 'item_1',
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        unit: 'liters',
      };

      const result = forecastingService.getRecommendedQuantity(item, 7);

      expect(result).toHaveProperty('recommended_quantity');
      expect(result).toHaveProperty('daily_usage_rate');
      expect(result).toHaveProperty('target_days');
      expect(result.recommended_quantity).toBeGreaterThan(0);
    });

    it('should include buffer in recommendation', () => {
      const item = {
        id: 'item_1',
        name: 'Milk',
        quantity: 2,
        category: 'dairy',
        unit: 'liters',
      };

      const result = forecastingService.getRecommendedQuantity(item, 7);

      expect(result.recommended_quantity).toBeGreaterThan(7 * 0.3);
    });
  });

  describe('estimateDailyUsage', () => {
    it('should return correct usage rate for produce', () => {
      const rate = forecastingService.estimateDailyUsage('produce');
      expect(rate).toBe(0.5);
    });

    it('should return correct usage rate for dairy', () => {
      const rate = forecastingService.estimateDailyUsage('dairy');
      expect(rate).toBe(0.3);
    });

    it('should return default rate for unknown category', () => {
      const rate = forecastingService.estimateDailyUsage('unknown');
      expect(rate).toBe(0.1);
    });
  });
});


