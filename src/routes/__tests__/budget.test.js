const request = require('supertest');
const express = require('express');
const { errorHandler, notFoundHandler } = require('../../middleware/errorHandler');

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
    this.budgets.set(period, { period, amount });
    return this.budgets.get(period);
  }

  getCurrentSpending(period) {
    const budget = this.budgets.get(period) || { amount: 0 };
    const spent = this.transactions.reduce((sum, t) => sum + t.cost, 0);
    return {
      period,
      spent,
      budget: budget.amount,
      remaining: budget.amount - spent,
      percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      status: spent >= budget.amount ? 'exceeded' : spent >= budget.amount * 0.8 ? 'warning' : 'ok',
    };
  }

  checkBudgetAllowance(itemCost) {
    const weekly = this.getCurrentSpending('week');
    const monthly = this.getCurrentSpending('month');
    const wouldExceed = (weekly.budget > 0 && weekly.spent + itemCost > weekly.budget) ||
                       (monthly.budget > 0 && monthly.spent + itemCost > monthly.budget);
    return {
      allowed: !wouldExceed,
      weekly: { would_exceed: weekly.budget > 0 && weekly.spent + itemCost > weekly.budget, remaining: weekly.remaining },
      monthly: { would_exceed: monthly.budget > 0 && monthly.spent + itemCost > monthly.budget, remaining: monthly.remaining },
    };
  }

  addSpendingTransaction(vendor, cost) {
    this.transactions.push({ vendor, cost, id: `txn_${Date.now()}` });
    return this.transactions[this.transactions.length - 1];
  }
}

class VendorService {
  constructor() {
    this.allowed = new Set();
    this.blocked = new Set();
  }

  addToAllowlist(vendor) {
    this.allowed.add(vendor);
    this.blocked.delete(vendor);
  }

  removeFromAllowlist(vendor) {
    this.allowed.delete(vendor);
  }

  blockVendor(vendor) {
    this.blocked.add(vendor);
    this.allowed.delete(vendor);
  }

  isVendorAllowed(vendor) {
    return this.allowed.has(vendor) && !this.blocked.has(vendor);
  }

  getAllowedVendors() {
    return Array.from(this.allowed);
  }

  getBlockedVendors() {
    return Array.from(this.blocked);
  }
}

const budgetService = new BudgetService();
const vendorService = new VendorService();

const budgetRouter = express.Router();
const vendorRouter = express.Router();

budgetRouter.post('/set-cap', (req, res) => {
  try {
    const { period, amount } = req.body;
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ success: false, error: { message: 'Amount must be a non-negative number' } });
    }
    const result = budgetService.setBudgetCap(period, amount);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

budgetRouter.get('/current', (req, res) => {
  const { period = 'week' } = req.query;
  const result = budgetService.getCurrentSpending(period);
  res.json({ success: true, data: result });
});

budgetRouter.post('/check', (req, res) => {
  try {
    const { item_cost } = req.body;
    const result = budgetService.checkBudgetAllowance(item_cost);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

budgetRouter.post('/transaction', (req, res) => {
  try {
    const { vendor, cost } = req.body;
    if (typeof cost !== 'number' || cost < 0) {
      return res.status(400).json({ success: false, error: { message: 'Cost must be a non-negative number' } });
    }
    const result = budgetService.addSpendingTransaction(vendor, cost);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

vendorRouter.post('/allow', (req, res) => {
  try {
    const { vendor_name } = req.body;
    vendorService.addToAllowlist(vendor_name);
    res.json({ success: true, data: { vendor: vendor_name, status: 'allowed' } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

vendorRouter.post('/block', (req, res) => {
  try {
    const { vendor_name } = req.body;
    vendorService.blockVendor(vendor_name);
    res.json({ success: true, data: { vendor: vendor_name, status: 'blocked' } });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

vendorRouter.get('/allowed', (req, res) => {
  const vendors = vendorService.getAllowedVendors();
  res.json({ success: true, data: { vendors, count: vendors.length } });
});

vendorRouter.get('/blocked', (req, res) => {
  const vendors = vendorService.getBlockedVendors();
  res.json({ success: true, data: { vendors, count: vendors.length } });
});

const app = express();
app.use(express.json());
app.use('/api/budget', budgetRouter);
app.use('/api/vendors', vendorRouter);
app.use(notFoundHandler);
app.use(errorHandler);

describe('Budget Routes', () => {
  beforeEach(() => {
    budgetService.budgets.clear();
    budgetService.transactions = [];
    vendorService.allowed.clear();
    vendorService.blocked.clear();
  });

  describe('POST /api/budget/set-cap', () => {
    it('should set weekly budget cap', async () => {
      const response = await request(app)
        .post('/api/budget/set-cap')
        .send({ period: 'week', amount: 500 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('week');
      expect(response.body.data.amount).toBe(500);
    });

    it('should set monthly budget cap', async () => {
      const response = await request(app)
        .post('/api/budget/set-cap')
        .send({ period: 'month', amount: 2000 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(2000);
    });

    it('should return 400 for invalid period', async () => {
      const response = await request(app)
        .post('/api/budget/set-cap')
        .send({ period: 'invalid', amount: 500 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for negative amount', async () => {
      const response = await request(app)
        .post('/api/budget/set-cap')
        .send({ period: 'week', amount: -100 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/budget/current', () => {
    it('should return current spending', async () => {
      budgetService.setBudgetCap('week', 500);
      budgetService.addSpendingTransaction('amazon', 100);

      const response = await request(app)
        .get('/api/budget/current')
        .query({ period: 'week' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.spent).toBe(100);
      expect(response.body.data.budget).toBe(500);
      expect(response.body.data.remaining).toBe(400);
    });

    it('should return zero when no budget set', async () => {
      const response = await request(app)
        .get('/api/budget/current')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.spent).toBe(0);
      expect(response.body.data.budget).toBe(0);
    });
  });

  describe('POST /api/budget/check', () => {
    it('should allow purchase within budget', async () => {
      budgetService.setBudgetCap('week', 500);
      budgetService.addSpendingTransaction('amazon', 200);

      const response = await request(app)
        .post('/api/budget/check')
        .send({ item_cost: 100 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.allowed).toBe(true);
    });

    it('should deny purchase exceeding budget', async () => {
      budgetService.setBudgetCap('week', 500);
      budgetService.addSpendingTransaction('amazon', 450);

      const response = await request(app)
        .post('/api/budget/check')
        .send({ item_cost: 100 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.allowed).toBe(false);
    });
  });

  describe('POST /api/budget/transaction', () => {
    it('should record spending transaction', async () => {
      const response = await request(app)
        .post('/api/budget/transaction')
        .send({ vendor: 'amazon', cost: 100 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor).toBe('amazon');
      expect(response.body.data.cost).toBe(100);
    });

    it('should return 400 for negative cost', async () => {
      const response = await request(app)
        .post('/api/budget/transaction')
        .send({ vendor: 'amazon', cost: -50 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('Vendor Routes', () => {
  beforeEach(() => {
    vendorService.allowed.clear();
    vendorService.blocked.clear();
  });

  describe('POST /api/vendors/allow', () => {
    it('should add vendor to allowlist', async () => {
      const response = await request(app)
        .post('/api/vendors/allow')
        .send({ vendor_name: 'amazon' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('allowed');
      expect(vendorService.isVendorAllowed('amazon')).toBe(true);
    });
  });

  describe('POST /api/vendors/block', () => {
    it('should block vendor', async () => {
      const response = await request(app)
        .post('/api/vendors/block')
        .send({ vendor_name: 'walmart' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('blocked');
      expect(vendorService.isVendorAllowed('walmart')).toBe(false);
    });
  });

  describe('GET /api/vendors/allowed', () => {
    it('should return list of allowed vendors', async () => {
      vendorService.addToAllowlist('amazon');
      vendorService.addToAllowlist('walmart');

      const response = await request(app)
        .get('/api/vendors/allowed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendors).toContain('amazon');
      expect(response.body.data.vendors).toContain('walmart');
      expect(response.body.data.count).toBe(2);
    });
  });

  describe('GET /api/vendors/blocked', () => {
    it('should return list of blocked vendors', async () => {
      vendorService.blockVendor('target');

      const response = await request(app)
        .get('/api/vendors/blocked')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendors).toContain('target');
      expect(response.body.data.count).toBe(1);
    });
  });
});

