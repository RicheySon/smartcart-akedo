const db = require('../db/index');
const logger = require('../utils/logger');

const CATEGORY_USAGE_RATES = {
  produce: 0.5,
  dairy: 0.3,
  meat: 0.2,
  pantry: 0.1,
  frozen: 0.15,
  other: 0.1,
};

const DEFAULT_RUNOUT_DAYS = 7;

class ForecastingService {
  constructor() {
    // Legacy in-memory Map removed.
    // Data now lives in db 'usage_history' collection.
  }

  // Mock data init is now handled via DB seeding if needed, or we treat empty DB as empty.
  initializeMockData() {
    // Optional: Seed DB if empty
    const existing = db.getCollection('usage_history');
    if (existing.length === 0) {
      const mockItems = [
        { name: 'Milk', category: 'dairy', history: [{ days_ago: 7, quantity: 2000 }, { days_ago: 0, quantity: 1000 }] }
        // Add more if needed for demo
      ];
      mockItems.forEach(item => {
        db.insert('usage_history', { name: item.name.toLowerCase(), history: item.history });
      });
    }
  }

  simpleLinearRegression(data) {
    if (!data || data.length < 2) {
      return {
        slope: 0,
        intercept: 0,
        r_squared: 0,
        error: 'Insufficient data points for regression',
      };
    }

    const n = data.length;
    const x = data.map(d => d.days_ago);
    const y = data.map(d => d.quantity);

    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominator = 0;
    let sumSquaredX = 0;
    let sumSquaredY = 0;

    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      denominator += diffX * diffX;
      sumSquaredX += diffX * diffX;
      sumSquaredY += diffY * diffY;
    }

    if (denominator === 0) {
      return {
        slope: 0,
        intercept: meanY,
        r_squared: 0,
        error: 'Cannot calculate slope: constant x values',
      };
    }

    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    const ssRes = data.reduce((sum, d, i) => {
      const predicted = slope * d.days_ago + intercept;
      const residual = d.quantity - predicted;
      return sum + residual * residual;
    }, 0);

    const ssTot = sumSquaredY;
    const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

    return {
      slope,
      intercept,
      r_squared: Math.max(0, Math.min(1, rSquared)),
    };
  }

  predictRunOutDate(currentQuantity, dailyUsageRate, itemName = null) {
    if (currentQuantity <= 0) {
      return {
        runout_date: new Date(),
        confidence: 1.0,
        days_until_runout: 0,
        status: 'out_of_stock',
      };
    }

    if (dailyUsageRate === 0 || isNaN(dailyUsageRate)) {
      return {
        runout_date: null,
        confidence: 0,
        days_until_runout: Infinity,
        status: 'no_usage',
        message: 'No usage detected - item may not be consumed',
      };
    }

    if (dailyUsageRate < 0) {
      return {
        runout_date: null,
        confidence: 0,
        days_until_runout: Infinity,
        status: 'restocking',
        message: 'Negative usage rate indicates restocking',
      };
    }

    const daysUntilRunout = currentQuantity / dailyUsageRate;
    const runoutDate = new Date();
    runoutDate.setDate(runoutDate.getDate() + Math.ceil(daysUntilRunout));

    let confidence = 0.7;
    // Check history from DB
    if (itemName) {
      const entry = db.findOne('usage_history', h => h.name === itemName.toLowerCase());
      if (entry && entry.history) {
        if (entry.history.length >= 5) confidence = 0.9;
        else if (entry.history.length >= 3) confidence = 0.8;
      }
    }

    return {
      runout_date: runoutDate.toISOString(),
      confidence: Math.round(confidence * 100) / 100,
      days_until_runout: Math.round(daysUntilRunout * 10) / 10,
      status: 'predicted',
    };
  }

  estimateDailyUsage(itemCategory) {
    return CATEGORY_USAGE_RATES[itemCategory] || CATEGORY_USAGE_RATES.other;
  }

  getUsageHistory(itemName) {
    const entry = db.findOne('usage_history', h => h.name === itemName.toLowerCase());
    return entry ? entry.history : [];
  }

  recordUsage(itemName, quantityConsumed, currentQuantity) {
    const key = itemName.toLowerCase();
    let entry = db.findOne('usage_history', h => h.name === key);

    if (!entry) {
      entry = { name: key, history: [] };
      db.insert('usage_history', entry);
    }

    // We work on a copy of history, then update
    const history = [...entry.history];

    // Logic: If latest entry is today (days_ago 0), update it. Else push new.
    // Note: This logic assumes 'days_ago' is managed relative to a baseline or updated daily.
    // For MVP, we'll simple add new entry at 0.

    history.unshift({
      days_ago: 0,
      quantity: currentQuantity,
      timestamp: new Date().toISOString()
    });

    if (history.length > 30) history.pop(); // Keep 30 entries

    // Update DB
    db.update('usage_history', h => h.name === key, { history: history });

    logger.info(`Recorded usage for ${itemName}: consumed ${quantityConsumed}`);
    return history;
  }

  predictItemRunOut(item) {
    const itemName = item.name.toLowerCase();
    const history = this.getUsageHistory(item.name);

    let dailyUsageRate;
    let regressionResult = null;
    let confidence = 0.5;

    if (history.length >= 2) {
      regressionResult = this.simpleLinearRegression(history);
      dailyUsageRate = Math.abs(regressionResult.slope);
      confidence = regressionResult.r_squared;
    } else {
      dailyUsageRate = this.estimateDailyUsage(item.category);
      confidence = 0.3;
    }

    const prediction = this.predictRunOutDate(
      item.quantity,
      dailyUsageRate,
      item.name
    );

    return {
      item_id: item.id,
      item_name: item.name,
      current_quantity: item.quantity,
      unit: item.unit,
      daily_usage_rate: Math.round(dailyUsageRate * 100) / 100,
      prediction: {
        ...prediction,
        confidence: Math.max(confidence, prediction.confidence),
      },
      regression: regressionResult,
    };
  }

  generateShoppingList(inventory) {
    const predictions = inventory.map(item => this.predictItemRunOut(item));

    const urgent = [];
    const soon = [];
    const planned = [];

    predictions.forEach(pred => {
      const days = pred.prediction.days_until_runout;

      if (pred.prediction.status === 'out_of_stock') {
        urgent.push(pred);
      } else if (pred.prediction.status === 'predicted') {
        if (days <= 2) {
          urgent.push(pred);
        } else if (days <= 7) {
          soon.push(pred);
        } else {
          planned.push(pred);
        }
      }
    });

    urgent.sort((a, b) => a.prediction.days_until_runout - b.prediction.days_until_runout);
    soon.sort((a, b) => a.prediction.days_until_runout - b.prediction.days_until_runout);
    planned.sort((a, b) => a.prediction.days_until_runout - b.prediction.days_until_runout);

    return {
      urgent: {
        items: urgent,
        count: urgent.length,
        timeframe: '0-2 days',
      },
      soon: {
        items: soon,
        count: soon.length,
        timeframe: '3-7 days',
      },
      planned: {
        items: planned,
        count: planned.length,
        timeframe: '8+ days',
      },
      total_items: urgent.length + soon.length + planned.length,
      generated_at: new Date().toISOString(),
    };
  }

  getRecommendedQuantity(item, targetDays = 7) {
    const history = this.getUsageHistory(item.name);
    let dailyUsageRate;

    if (history.length >= 2) {
      const regression = this.simpleLinearRegression(history);
      dailyUsageRate = Math.abs(regression.slope);
    } else {
      dailyUsageRate = this.estimateDailyUsage(item.category);
    }

    const recommendedQuantity = Math.ceil(dailyUsageRate * targetDays);
    const buffer = Math.ceil(recommendedQuantity * 0.2);
    const totalRecommended = recommendedQuantity + buffer;

    return {
      item_id: item.id,
      item_name: item.name,
      current_quantity: item.quantity,
      daily_usage_rate: Math.round(dailyUsageRate * 100) / 100,
      recommended_quantity: totalRecommended,
      target_days: targetDays,
      reasoning: `Based on daily usage of ${Math.round(dailyUsageRate * 100) / 100} ${item.unit}/day, need ${totalRecommended} ${item.unit} for ${targetDays} days (with 20% buffer)`,
    };
  }
}

module.exports = new ForecastingService();






