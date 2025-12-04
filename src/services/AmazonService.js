const logger = require('../utils/logger');

const MOCK_PRODUCTS = [
  { id: 'amz-001', name: 'Organic Whole Milk 1 Gallon', price: 4.99, category: 'dairy', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-002', name: 'Whole Wheat Bread Loaf', price: 2.49, category: 'bakery', rating: 4.2, in_stock: true, vendor: 'amazon' },
  { id: 'amz-003', name: 'Large Grade A Eggs 12 Count', price: 3.79, category: 'dairy', rating: 4.6, in_stock: true, vendor: 'amazon' },
  { id: 'amz-004', name: 'Fresh Bananas 2 lbs', price: 1.99, category: 'produce', rating: 4.4, in_stock: true, vendor: 'amazon' },
  { id: 'amz-005', name: 'Organic Baby Spinach 10 oz', price: 3.49, category: 'produce', rating: 4.3, in_stock: true, vendor: 'amazon' },
  { id: 'amz-006', name: 'Chicken Breast Boneless 1 lb', price: 5.99, category: 'meat', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-007', name: 'Ground Beef 80/20 1 lb', price: 4.99, category: 'meat', rating: 4.4, in_stock: true, vendor: 'amazon' },
  { id: 'amz-008', name: 'Salmon Fillet 6 oz', price: 7.99, category: 'meat', rating: 4.7, in_stock: true, vendor: 'amazon' },
  { id: 'amz-009', name: 'White Rice 2 lbs', price: 2.99, category: 'pantry', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-010', name: 'Pasta Spaghetti 1 lb', price: 1.49, category: 'pantry', rating: 4.3, in_stock: true, vendor: 'amazon' },
  { id: 'amz-011', name: 'Olive Oil Extra Virgin 16 oz', price: 6.99, category: 'pantry', rating: 4.6, in_stock: true, vendor: 'amazon' },
  { id: 'amz-012', name: 'Tomato Sauce 15 oz', price: 1.29, category: 'pantry', rating: 4.2, in_stock: true, vendor: 'amazon' },
  { id: 'amz-013', name: 'Black Beans Canned 15 oz', price: 0.99, category: 'pantry', rating: 4.4, in_stock: true, vendor: 'amazon' },
  { id: 'amz-014', name: 'Chicken Broth 32 oz', price: 2.49, category: 'pantry', rating: 4.3, in_stock: true, vendor: 'amazon' },
  { id: 'amz-015', name: 'Frozen Mixed Vegetables 16 oz', price: 2.99, category: 'frozen', rating: 4.1, in_stock: true, vendor: 'amazon' },
  { id: 'amz-016', name: 'Frozen Pizza Cheese 12 inch', price: 4.49, category: 'frozen', rating: 4.0, in_stock: true, vendor: 'amazon' },
  { id: 'amz-017', name: 'Ice Cream Vanilla 1.5 qt', price: 4.99, category: 'frozen', rating: 4.6, in_stock: true, vendor: 'amazon' },
  { id: 'amz-018', name: 'Greek Yogurt Plain 32 oz', price: 4.49, category: 'dairy', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-019', name: 'Cheddar Cheese Block 8 oz', price: 3.99, category: 'dairy', rating: 4.4, in_stock: true, vendor: 'amazon' },
  { id: 'amz-020', name: 'Butter Unsalted 1 lb', price: 4.29, category: 'dairy', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-021', name: 'Fresh Strawberries 1 lb', price: 3.99, category: 'produce', rating: 4.3, in_stock: true, vendor: 'amazon' },
  { id: 'amz-022', name: 'Fresh Broccoli Crowns 1 lb', price: 2.49, category: 'produce', rating: 4.2, in_stock: true, vendor: 'amazon' },
  { id: 'amz-023', name: 'Fresh Carrots 1 lb', price: 1.49, category: 'produce', rating: 4.4, in_stock: true, vendor: 'amazon' },
  { id: 'amz-024', name: 'Fresh Tomatoes 1 lb', price: 2.99, category: 'produce', rating: 4.1, in_stock: true, vendor: 'amazon' },
  { id: 'amz-025', name: 'Fresh Onions Yellow 2 lbs', price: 1.99, category: 'produce', rating: 4.3, in_stock: true, vendor: 'amazon' },
  { id: 'amz-026', name: 'Fresh Garlic Bulb', price: 0.99, category: 'produce', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-027', name: 'Fresh Avocados 3 Count', price: 3.99, category: 'produce', rating: 4.4, in_stock: true, vendor: 'amazon' },
  { id: 'amz-028', name: 'Fresh Bell Peppers 3 Pack', price: 3.49, category: 'produce', rating: 4.2, in_stock: true, vendor: 'amazon' },
  { id: 'amz-029', name: 'Fresh Cucumbers 3 Count', price: 2.99, category: 'produce', rating: 4.3, in_stock: true, vendor: 'amazon' },
  { id: 'amz-030', name: 'Fresh Lettuce Romaine 1 Head', price: 2.49, category: 'produce', rating: 4.1, in_stock: true, vendor: 'amazon' },
  { id: 'amz-031', name: 'Ground Turkey 1 lb', price: 4.49, category: 'meat', rating: 4.3, in_stock: true, vendor: 'amazon' },
  { id: 'amz-032', name: 'Pork Chops Bone-In 1 lb', price: 5.49, category: 'meat', rating: 4.4, in_stock: true, vendor: 'amazon' },
  { id: 'amz-033', name: 'Tilapia Fillets 1 lb', price: 6.99, category: 'meat', rating: 4.2, in_stock: true, vendor: 'amazon' },
  { id: 'amz-034', name: 'All Purpose Flour 5 lbs', price: 2.99, category: 'pantry', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-035', name: 'Sugar Granulated 4 lbs', price: 2.49, category: 'pantry', rating: 4.4, in_stock: true, vendor: 'amazon' },
  { id: 'amz-036', name: 'Salt Table 26 oz', price: 0.99, category: 'pantry', rating: 4.6, in_stock: true, vendor: 'amazon' },
  { id: 'amz-037', name: 'Black Pepper Ground 4 oz', price: 2.99, category: 'pantry', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-038', name: 'Canned Tuna in Water 5 oz', price: 1.49, category: 'pantry', rating: 4.3, in_stock: true, vendor: 'amazon' },
  { id: 'amz-039', name: 'Peanut Butter Creamy 16 oz', price: 3.99, category: 'pantry', rating: 4.6, in_stock: true, vendor: 'amazon' },
  { id: 'amz-040', name: 'Honey Pure 16 oz', price: 5.99, category: 'pantry', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-041', name: 'Frozen Chicken Nuggets 20 oz', price: 4.99, category: 'frozen', rating: 4.2, in_stock: true, vendor: 'amazon' },
  { id: 'amz-042', name: 'Frozen French Fries 32 oz', price: 3.49, category: 'frozen', rating: 4.1, in_stock: true, vendor: 'amazon' },
  { id: 'amz-043', name: 'Frozen Berries Mixed 16 oz', price: 4.99, category: 'frozen', rating: 4.4, in_stock: true, vendor: 'amazon' },
  { id: 'amz-044', name: 'Orange Juice 64 oz', price: 3.99, category: 'beverages', rating: 4.3, in_stock: true, vendor: 'amazon' },
  { id: 'amz-045', name: 'Coffee Ground Medium Roast 12 oz', price: 6.99, category: 'beverages', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-046', name: 'Tea Bags Black 100 Count', price: 3.49, category: 'beverages', rating: 4.4, in_stock: true, vendor: 'amazon' },
  { id: 'amz-047', name: 'Cereal Cheerios 18 oz', price: 4.99, category: 'pantry', rating: 4.5, in_stock: true, vendor: 'amazon' },
  { id: 'amz-048', name: 'Oatmeal Quick 18 oz', price: 2.99, category: 'pantry', rating: 4.3, in_stock: true, vendor: 'amazon' },
  { id: 'amz-049', name: 'Crackers Saltine 16 oz', price: 2.49, category: 'pantry', rating: 4.2, in_stock: true, vendor: 'amazon' },
  { id: 'amz-050', name: 'Chips Tortilla 13 oz', price: 3.99, category: 'snacks', rating: 4.4, in_stock: true, vendor: 'amazon' },
];

const CATEGORIES = [
  'dairy', 'bakery', 'produce', 'meat', 'pantry', 'frozen',
  'beverages', 'snacks', 'other'
];

class AmazonService {
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
      vendor: 'amazon',
    }));

    logger.debug(`Amazon search for "${query}": found ${results.length} products`);
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
      vendor: 'amazon',
      description: `High-quality ${product.name.toLowerCase()} from Amazon. Fresh and delivered to your door.`,
      shipping: {
        free_shipping: product.price >= 25,
        estimated_days: product.price >= 25 ? 1 : 2,
        cost: product.price >= 25 ? 0 : 5.99,
      },
      reviews_count: Math.floor(Math.random() * 5000) + 100,
      seller: 'Amazon Fresh',
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
      vendor: 'amazon',
      last_updated: new Date().toISOString(),
    };
  }

  getAllProducts() {
    return MOCK_PRODUCTS;
  }
}

module.exports = new AmazonService();

