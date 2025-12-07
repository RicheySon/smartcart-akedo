const db = require('../db/index');
const logger = require('../utils/logger');
const transactionService = require('./TransactionService');

class BudgetService {
    constructor() {
        this.DEFAULT_CAP = 500; // Default monthly budget
    }

    // Set Budget Cap (Persisted in Settings)
    setBudgetCap(amount, period = 'monthly') {
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Invalid budget amount');
        }

        const settings = {
            cap: amount,
            period: period,
            updated_at: new Date().toISOString()
        };

        db.setSetting('budget_cap', settings);
        logger.info(`Budget cap set to $${amount} (${period})`);
        return settings;
    }

    getBudgetCap() {
        const cap = db.getSetting('budget_cap');
        return cap || { cap: this.DEFAULT_CAP, period: 'monthly' };
    }

    // Calculate current spending based on persistent transactions
    async getCurrentSpending(period = 'monthly') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get all completed or approved transactions
        const transactions = db.find('transactions', t =>
            (t.status === 'completed' || t.status === 'approved') &&
            new Date(t.created_at) >= startOfMonth
        );

        const totalSpent = transactions.reduce((sum, t) => sum + t.total_cost, 0);
        const budget = this.getBudgetCap();

        return {
            spent: totalSpent,
            budget: budget.cap,
            remaining: Math.max(0, budget.cap - totalSpent),
            percentage: Math.min(100, Math.round((totalSpent / budget.cap) * 100)),
            period: budget.period
        };
    }

    // Check if a potential purchase allows budget
    async checkBudgetAllowance(cost) {
        const current = await this.getCurrentSpending();
        if (current.spent + cost > current.budget) {
            return {
                allowed: false,
                reason: 'Exceeds budget cap',
                current_spent: current.spent,
                budget: current.budget
            };
        }
        return { allowed: true };
    }
}

module.exports = new BudgetService();
