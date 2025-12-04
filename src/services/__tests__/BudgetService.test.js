const logger = require('../../utils/logger');

jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

class BudgetService {
  constructor() {
    this.budgets = new Map();
    this.transactions = [];
  }

  setBudgetCap(period, amount) {
    if (!['week', 'month'].includes(period)) {
      throw new Error('Period must be week or month');
    }
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('Amount must be a non-negative number');
    }

    const key = `${period}_${this.getCurrentPeriod(period)}`;
    this.budgets.set(key, {
      period,
      amount,
      start_date: this.getPeriodStart(period),
      end_date: this.getPeriodEnd(period),
    });

    return this.budgets.get(key);
  }

  getCurrentSpending(period) {
    const key = `${period}_${this.getCurrentPeriod(period)}`;
    const budget = this.budgets.get(key);
    const periodStart = this.getPeriodStart(period);

    const spending = this.transactions
      .filter(t => new Date(t.date) >= periodStart)
      .reduce((sum, t) => sum + t.cost, 0);

    return {
      period,
      spent: spending,
      budget: budget ? budget.amount : 0,
      remaining: budget ? budget.amount - spending : 0,
      percentage: budget ? (spending / budget.amount) * 100 : 0,
      status: this.getStatus(spending, budget ? budget.amount : 0),
    };
  }

  checkBudgetAllowance(itemCost) {
    const weekly = this.getCurrentSpending('week');
    const monthly = this.getCurrentSpending('month');

    const wouldExceedWeekly = weekly.budget > 0 && weekly.spent + itemCost > weekly.budget;
    const wouldExceedMonthly = monthly.budget > 0 && monthly.spent + itemCost > monthly.budget;

    return {
      allowed: !wouldExceedWeekly && !wouldExceedMonthly,
      weekly: {
        would_exceed: wouldExceedWeekly,
        remaining: weekly.remaining,
      },
      monthly: {
        would_exceed: wouldExceedMonthly,
        remaining: monthly.remaining,
      },
    };
  }

  addSpendingTransaction(vendor, cost, date = new Date()) {
    if (typeof cost !== 'number' || cost < 0) {
      throw new Error('Cost must be a non-negative number');
    }

    this.transactions.push({
      vendor,
      cost,
      date: date instanceof Date ? date : new Date(date),
      id: `txn_${Date.now()}`,
    });

    return this.transactions[this.transactions.length - 1];
  }

  getPeriodStart(period) {
    const now = new Date();
    if (period === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day;
      return new Date(now.setDate(diff));
    } else {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  getPeriodEnd(period) {
    const start = this.getPeriodStart(period);
    if (period === 'week') {
      return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    } else {
      return new Date(start.getFullYear(), start.getMonth() + 1, 0);
    }
  }

  getCurrentPeriod(period) {
    const start = this.getPeriodStart(period);
    return period === 'week'
      ? `${start.getFullYear()}-W${Math.ceil((start.getDate() + start.getDay()) / 7)}`
      : `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  }

  getStatus(spent, budget) {
    if (budget === 0) return 'no_budget';
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    return 'ok';
  }
}

const budgetService = new BudgetService();

describe('BudgetService', () => {
  beforeEach(() => {
    budgetService.budgets.clear();
    budgetService.transactions = [];
  });

  describe('setBudgetCap', () => {
    it('should set weekly budget cap', () => {
      const result = budgetService.setBudgetCap('week', 500);

      expect(result.period).toBe('week');
      expect(result.amount).toBe(500);
      expect(result).toHaveProperty('start_date');
      expect(result).toHaveProperty('end_date');
    });

    it('should set monthly budget cap', () => {
      const result = budgetService.setBudgetCap('month', 2000);

      expect(result.period).toBe('month');
      expect(result.amount).toBe(2000);
    });

    it('should throw error for invalid period', () => {
      expect(() => {
        budgetService.setBudgetCap('invalid', 500);
      }).toThrow('Period must be week or month');
    });

    it('should throw error for negative amount', () => {
      expect(() => {
        budgetService.setBudgetCap('week', -100);
      }).toThrow('Amount must be a non-negative number');
    });
  });

  describe('getCurrentSpending', () => {
    it('should return zero spending when no transactions', () => {
      budgetService.setBudgetCap('week', 500);
      const result = budgetService.getCurrentSpending('week');

      expect(result.spent).toBe(0);
      expect(result.budget).toBe(500);
      expect(result.remaining).toBe(500);
      expect(result.percentage).toBe(0);
      expect(result.status).toBe('ok');
    });

    it('should calculate spending correctly', () => {
      budgetService.setBudgetCap('week', 500);
      budgetService.addSpendingTransaction('amazon', 100);
      budgetService.addSpendingTransaction('walmart', 50);

      const result = budgetService.getCurrentSpending('week');

      expect(result.spent).toBe(150);
      expect(result.remaining).toBe(350);
      expect(result.percentage).toBe(30);
    });

    it('should return warning status at 80%', () => {
      budgetService.setBudgetCap('week', 500);
      budgetService.addSpendingTransaction('amazon', 400);

      const result = budgetService.getCurrentSpending('week');

      expect(result.status).toBe('warning');
      expect(result.percentage).toBeGreaterThanOrEqual(80);
    });

    it('should return exceeded status at 100%', () => {
      budgetService.setBudgetCap('week', 500);
      budgetService.addSpendingTransaction('amazon', 500);

      const result = budgetService.getCurrentSpending('week');

      expect(result.status).toBe('exceeded');
      expect(result.percentage).toBeGreaterThanOrEqual(100);
    });
  });

  describe('checkBudgetAllowance', () => {
    it('should allow purchase within budget', () => {
      budgetService.setBudgetCap('week', 500);
      budgetService.addSpendingTransaction('amazon', 200);

      const result = budgetService.checkBudgetAllowance(100);

      expect(result.allowed).toBe(true);
      expect(result.weekly.would_exceed).toBe(false);
    });

    it('should deny purchase that exceeds budget', () => {
      budgetService.setBudgetCap('week', 500);
      budgetService.addSpendingTransaction('amazon', 450);

      const result = budgetService.checkBudgetAllowance(100);

      expect(result.allowed).toBe(false);
      expect(result.weekly.would_exceed).toBe(true);
    });

    it('should check both weekly and monthly budgets', () => {
      budgetService.setBudgetCap('week', 500);
      budgetService.setBudgetCap('month', 2000);
      budgetService.addSpendingTransaction('amazon', 1900);

      const result = budgetService.checkBudgetAllowance(150);

      expect(result.allowed).toBe(false);
      expect(result.monthly.would_exceed).toBe(true);
    });
  });

  describe('addSpendingTransaction', () => {
    it('should add spending transaction', () => {
      const result = budgetService.addSpendingTransaction('amazon', 100);

      expect(result.vendor).toBe('amazon');
      expect(result.cost).toBe(100);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('date');
    });

    it('should throw error for negative cost', () => {
      expect(() => {
        budgetService.addSpendingTransaction('amazon', -50);
      }).toThrow('Cost must be a non-negative number');
    });

    it('should accept date parameter', () => {
      const date = new Date('2024-01-15');
      const result = budgetService.addSpendingTransaction('walmart', 50, date);

      expect(result.date).toEqual(date);
    });
  });
});

module.exports = BudgetService;

