const logger = require('../utils/logger');

class SmartOCRService {
    constructor() {
        // Regex patterns for common receipt formats
        this.patterns = [
            // Pattern 1: "Milk 3.99" or "Item Name $3.99"
            /([a-zA-Z\s]+)\s+\$?(\d+\.\d{2})/i,
            // Pattern 2: "3x Eggs" (Quantity first)
            /(\d+)x\s+([a-zA-Z\s]+)/i
        ];
    }

    parseReceiptText(text) {
        logger.info('Parsing raw receipt text...');
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const validItems = [];

        lines.forEach(line => {
            // Clean noise
            const cleanLine = line.replace(/[^a-zA-Z0-9\s.$]/g, '').trim();
            if (cleanLine.length < 3) return;

            // Basic heuristic parsing
            // Try to find price
            const priceMatch = cleanLine.match(/(\d+\.\d{2})/);
            const price = priceMatch ? parseFloat(priceMatch[0]) : 0; // Default 0 if not found

            // Try to find Name (remove price from string)
            let name = cleanLine.replace(/(\d+\.\d{2})/, '').replace('$', '').trim();

            // Categorization Rule Engine (Simple NLP Mock)
            const category = this.predictCategory(name);

            if (name && name.length > 2) {
                validItems.push({
                    name: name,
                    price: price,
                    quantity: 1, // Default to 1 unless "3x" found
                    category: category,
                    confidence: 0.85 // Mock confidence score
                });
            }
        });

        return {
            success: validItems.length > 0,
            item_count: validItems.length,
            items: validItems
        };
    }

    predictCategory(name) {
        const n = name.toLowerCase();
        if (n.includes('milk') || n.includes('cheese') || n.includes('yogurt')) return 'dairy';
        if (n.includes('steak') || n.includes('beef') || n.includes('chicken')) return 'meat';
        if (n.includes('apple') || n.includes('banana') || n.includes('lettuce')) return 'produce';
        if (n.includes('bread') || n.includes('cereal') || n.includes('rice')) return 'pantry';
        if (n.includes('pizza') || n.includes('ice cream')) return 'frozen';
        return 'other';
    }
}

module.exports = new SmartOCRService();
