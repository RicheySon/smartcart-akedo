const amazonService = require('./AmazonService');
const walmartService = require('./WalmartService');
const logger = require('../utils/logger');

class ComparisonService {
  comparePrices(itemName) {
    if (!itemName || typeof itemName !== 'string') {
      throw new Error('Item name is required');
    }

    const amazonResults = amazonService.searchProducts(itemName, 1);
    const walmartResults = walmartService.searchProducts(itemName, 1);

    const amazonProduct = amazonResults.length > 0 ? amazonResults[0] : null;
    const walmartProduct = walmartResults.length > 0 ? walmartResults[0] : null;

    let cheaper = null;
    let savings = 0;
    let savingsPercentage = 0;

    if (amazonProduct && walmartProduct) {
      if (amazonProduct.price < walmartProduct.price) {
        cheaper = 'amazon';
        savings = walmartProduct.price - amazonProduct.price;
        savingsPercentage = ((savings / walmartProduct.price) * 100).toFixed(1);
      } else if (walmartProduct.price < amazonProduct.price) {
        cheaper = 'walmart';
        savings = amazonProduct.price - walmartProduct.price;
        savingsPercentage = ((savings / amazonProduct.price) * 100).toFixed(1);
      } else {
        cheaper = 'same';
      }
    } else if (amazonProduct) {
      cheaper = 'amazon';
    } else if (walmartProduct) {
      cheaper = 'walmart';
    }

    return {
      item_name: itemName,
      amazon: amazonProduct ? {
        id: amazonProduct.id,
        name: amazonProduct.name,
        price: amazonProduct.price,
        rating: amazonProduct.rating,
        in_stock: amazonProduct.in_stock,
      } : null,
      walmart: walmartProduct ? {
        id: walmartProduct.id,
        name: walmartProduct.name,
        price: walmartProduct.price,
        rating: walmartProduct.rating,
        in_stock: walmartProduct.in_stock,
      } : null,
      comparison: {
        cheaper_vendor: cheaper,
        price_difference: savings > 0 ? savings : 0,
        savings_percentage: savingsPercentage > 0 ? `${savingsPercentage}%` : '0%',
        recommendation: this.getRecommendation(amazonProduct, walmartProduct, cheaper),
      },
    };
  }

  getRecommendation(amazonProduct, walmartProduct, cheaper) {
    if (!amazonProduct && !walmartProduct) {
      return 'No products found on either platform';
    }

    if (!amazonProduct) {
      return 'Only available at Walmart';
    }

    if (!walmartProduct) {
      return 'Only available at Amazon';
    }

    if (cheaper === 'same') {
      return 'Same price on both platforms. Consider shipping and delivery time.';
    }

    if (cheaper === 'amazon') {
      const savings = walmartProduct.price - amazonProduct.price;
      return `Amazon is $${savings.toFixed(2)} cheaper. Consider Amazon for better value.`;
    }

    if (cheaper === 'walmart') {
      const savings = amazonProduct.price - walmartProduct.price;
      return `Walmart is $${savings.toFixed(2)} cheaper. Consider Walmart for better value.`;
    }

    return 'Compare both options before purchasing';
  }

  findCheaperOption(itemName, preferredVendor = null) {
    const comparison = this.comparePrices(itemName);

    if (!comparison.amazon && !comparison.walmart) {
      return {
        found: false,
        message: 'Product not found on either platform',
      };
    }

    const cheaper = comparison.comparison.cheaper_vendor;
    let recommendation = null;

    if (cheaper === 'amazon' && comparison.amazon) {
      recommendation = comparison.amazon;
    } else if (cheaper === 'walmart' && comparison.walmart) {
      recommendation = comparison.walmart;
    } else if (comparison.amazon) {
      recommendation = comparison.amazon;
    } else if (comparison.walmart) {
      recommendation = comparison.walmart;
    }

    if (preferredVendor && preferredVendor.toLowerCase() === 'amazon' && comparison.amazon) {
      recommendation = comparison.amazon;
    } else if (preferredVendor && preferredVendor.toLowerCase() === 'walmart' && comparison.walmart) {
      recommendation = comparison.walmart;
    }

    return {
      found: true,
      item_name: itemName,
      recommended: recommendation,
      cheaper_vendor: cheaper,
      savings: comparison.comparison.price_difference,
      recommendation_reason: comparison.comparison.recommendation,
    };
  }

  buildOptimalCart(itemsNeeded, budget = null) {
    if (!Array.isArray(itemsNeeded) || itemsNeeded.length === 0) {
      throw new Error('Items needed must be a non-empty array');
    }

    const cart = {
      amazon: {
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
      },
      walmart: {
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
      },
      total_cost: 0,
      savings: 0,
      recommendations: [],
    };

    itemsNeeded.forEach(item => {
      const comparison = this.comparePrices(item.name || item);
      const quantity = item.quantity || 1;

      let selectedVendor = null;
      let selectedProduct = null;

      if (comparison.comparison.cheaper_vendor === 'amazon' && comparison.amazon) {
        selectedVendor = 'amazon';
        selectedProduct = comparison.amazon;
      } else if (comparison.comparison.cheaper_vendor === 'walmart' && comparison.walmart) {
        selectedVendor = 'walmart';
        selectedProduct = comparison.walmart;
      } else if (comparison.amazon) {
        selectedVendor = 'amazon';
        selectedProduct = comparison.amazon;
      } else if (comparison.walmart) {
        selectedVendor = 'walmart';
        selectedProduct = comparison.walmart;
      }

      if (selectedVendor && selectedProduct) {
        const itemTotal = selectedProduct.price * quantity;
        const shipping = this.calculateShippingEstimate(selectedVendor, itemTotal);

        cart[selectedVendor].items.push({
          id: selectedProduct.id,
          name: selectedProduct.name,
          quantity,
          unit_price: selectedProduct.price,
          total: itemTotal,
        });

        cart[selectedVendor].subtotal += itemTotal;
        cart[selectedVendor].shipping = Math.max(cart[selectedVendor].shipping, shipping);
      }
    });

    cart.amazon.total = cart.amazon.subtotal + cart.amazon.shipping;
    cart.walmart.total = cart.walmart.subtotal + cart.walmart.shipping;
    cart.total_cost = cart.amazon.total + cart.walmart.total;

    if (budget && cart.total_cost > budget) {
      cart.recommendations.push(`Cart exceeds budget by $${(cart.total_cost - budget).toFixed(2)}`);
      cart.recommendations.push('Consider removing items or finding cheaper alternatives');
    }

    cart.recommendations.push(`Total savings: $${cart.savings.toFixed(2)} by shopping at optimal vendors`);

    return cart;
  }

  calculateShippingEstimate(vendor, cost) {
    if (vendor.toLowerCase() === 'amazon') {
      return cost >= 25 ? 0 : 5.99;
    } else if (vendor.toLowerCase() === 'walmart') {
      return cost >= 35 ? 0 : 7.99;
    }
    return 0;
  }

  searchAcrossVendors(query, limit = 5) {
    const amazonResults = amazonService.searchProducts(query, limit);
    const walmartResults = walmartService.searchProducts(query, limit);

    return {
      query,
      amazon: {
        vendor: 'amazon',
        results: amazonResults,
        count: amazonResults.length,
      },
      walmart: {
        vendor: 'walmart',
        results: walmartResults,
        count: walmartResults.length,
      },
      total_results: amazonResults.length + walmartResults.length,
    };
  }
}

module.exports = new ComparisonService();

