const logger = require('../utils/logger');

const MOCK_PRODUCTS = [
  { id: 'wmt-001', name: 'Organic Whole Milk 1 Gallon', price: 3.49, category: 'dairy', rating: 4.3, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-002', name: 'Whole Wheat Bread Loaf', price: 1.99, category: 'bakery', rating: 4.0, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-003', name: 'Large Grade A Eggs 12 Count', price: 2.99, category: 'dairy', rating: 4.4, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-004', name: 'Fresh Bananas 2 lbs', price: 1.49, category: 'produce', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-005', name: 'Organic Baby Spinach 10 oz', price: 2.99, category: 'produce', rating: 4.1, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-006', name: 'Chicken Breast Boneless 1 lb', price: 4.99, category: 'meat', rating: 4.3, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-007', name: 'Ground Beef 80/20 1 lb', price: 4.49, category: 'meat', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-008', name: 'Salmon Fillet 6 oz', price: 6.99, category: 'meat', rating: 4.5, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-009', name: 'White Rice 2 lbs', price: 2.49, category: 'pantry', rating: 4.4, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-010', name: 'Pasta Spaghetti 1 lb', price: 1.29, category: 'pantry', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-011', name: 'Olive Oil Extra Virgin 16 oz', price: 5.99, category: 'pantry', rating: 4.5, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-012', name: 'Tomato Sauce 15 oz', price: 0.99, category: 'pantry', rating: 4.1, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-013', name: 'Black Beans Canned 15 oz', price: 0.89, category: 'pantry', rating: 4.3, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-014', name: 'Chicken Broth 32 oz', price: 1.99, category: 'pantry', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-015', name: 'Frozen Mixed Vegetables 16 oz', price: 2.49, category: 'frozen', rating: 4.0, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-016', name: 'Frozen Pizza Cheese 12 inch', price: 3.99, category: 'frozen', rating: 3.9, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-017', name: 'Ice Cream Vanilla 1.5 qt', price: 3.99, category: 'frozen', rating: 4.4, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-018', name: 'Greek Yogurt Plain 32 oz', price: 3.99, category: 'dairy', rating: 4.3, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-019', name: 'Cheddar Cheese Block 8 oz', price: 3.49, category: 'dairy', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-020', name: 'Butter Unsalted 1 lb', price: 3.99, category: 'dairy', rating: 4.4, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-021', name: 'Fresh Strawberries 1 lb', price: 3.49, category: 'produce', rating: 4.1, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-022', name: 'Fresh Broccoli Crowns 1 lb', price: 1.99, category: 'produce', rating: 4.0, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-023', name: 'Fresh Carrots 1 lb', price: 0.99, category: 'produce', rating: 4.3, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-024', name: 'Fresh Tomatoes 1 lb', price: 2.49, category: 'produce', rating: 4.0, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-025', name: 'Fresh Onions Yellow 2 lbs', price: 1.49, category: 'produce', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-026', name: 'Fresh Garlic Bulb', price: 0.79, category: 'produce', rating: 4.4, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-027', name: 'Fresh Avocados 3 Count', price: 3.49, category: 'produce', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-028', name: 'Fresh Bell Peppers 3 Pack', price: 2.99, category: 'produce', rating: 4.1, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-029', name: 'Fresh Cucumbers 3 Count', price: 2.49, category: 'produce', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-030', name: 'Fresh Lettuce Romaine 1 Head', price: 1.99, category: 'produce', rating: 4.0, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-031', name: 'Ground Turkey 1 lb', price: 3.99, category: 'meat', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-032', name: 'Pork Chops Bone-In 1 lb', price: 4.99, category: 'meat', rating: 4.3, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-033', name: 'Tilapia Fillets 1 lb', price: 5.99, category: 'meat', rating: 4.1, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-034', name: 'All Purpose Flour 5 lbs', price: 2.49, category: 'pantry', rating: 4.4, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-035', name: 'Sugar Granulated 4 lbs', price: 1.99, category: 'pantry', rating: 4.3, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-036', name: 'Salt Table 26 oz', price: 0.79, category: 'pantry', rating: 4.5, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-037', name: 'Black Pepper Ground 4 oz', price: 2.49, category: 'pantry', rating: 4.4, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-038', name: 'Canned Tuna in Water 5 oz', price: 1.29, category: 'pantry', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-039', name: 'Peanut Butter Creamy 16 oz', price: 3.49, category: 'pantry', rating: 4.5, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-040', name: 'Honey Pure 16 oz', price: 4.99, category: 'pantry', rating: 4.4, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-041', name: 'Frozen Chicken Nuggets 20 oz', price: 4.49, category: 'frozen', rating: 4.1, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-042', name: 'Frozen French Fries 32 oz', price: 2.99, category: 'frozen', rating: 4.0, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-043', name: 'Frozen Berries Mixed 16 oz', price: 3.99, category: 'frozen', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-044', name: 'Orange Juice 64 oz', price: 3.49, category: 'beverages', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-045', name: 'Coffee Ground Medium Roast 12 oz', price: 5.99, category: 'beverages', rating: 4.4, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-046', name: 'Tea Bags Black 100 Count', price: 2.99, category: 'beverages', rating: 4.3, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-047', name: 'Cereal Cheerios 18 oz', price: 3.99, category: 'pantry', rating: 4.4, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-048', name: 'Oatmeal Quick 18 oz', price: 2.49, category: 'pantry', rating: 4.2, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-049', name: 'Crackers Saltine 16 oz', price: 1.99, category: 'pantry', rating: 4.1, in_stock: true, vendor: 'walmart' },
  { id: 'wmt-050', name: 'Chips Tortilla 13 oz', price: 3.49, category: 'snacks', rating: 4.3, in_stock: true, vendor: 'walmart' },
];

const CATEGORIES = [
  'dairy', 'bakery', 'produce', 'meat', 'pantry', 'frozen',
  'beverages', 'snacks', 'other'
];

class WalmartService {
  searchProducts(query, limit = 5) {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const matches = MOCK_PRODUCTS.filter(product => {
      return product.name.toLowerCase().includes(searchTerm) ||
             product.category.toLowerCase().includes(searchTerm);
    });

    const results = matches.slice(0, limit).map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      rating: product.rating,
      in_stock: product.in_stock,
      vendor: 'walmart',
    }));

    logger.debug(`Walmart search for "${query}": found ${results.length} products`);
    return results;
  }

  getProductDetails(productId) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);

    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      rating: product.rating,
      in_stock: product.in_stock,
      vendor: 'walmart',
      description: `Great value ${product.name.toLowerCase()} from Walmart. Quality products at everyday low prices.`,
      shipping: {
        free_shipping: product.price >= 35,
        estimated_days: product.price >= 35 ? 2 : 3,
        cost: product.price >= 35 ? 0 : 7.99,
      },
      reviews_count: Math.floor(Math.random() * 3000) + 50,
      seller: 'Walmart',
    };
  }

  getCategories() {
    return CATEGORIES;
  }

  getPrice(productId) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);

    if (!product) {
      throw new Error(`Product with id ${productId} not found`);
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      currency: 'USD',
      vendor: 'walmart',
      last_updated: new Date().toISOString(),
    };
  }

  getAllProducts() {
    return MOCK_PRODUCTS;
  }
}

module.exports = new WalmartService();

