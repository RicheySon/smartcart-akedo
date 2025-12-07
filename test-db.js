require('dotenv').config();
const db = require('./src/db/index');

console.log('Testing database...');

// Test getCollection
const inventory = db.getCollection('inventory');
console.log('Inventory type:', typeof inventory);
console.log('Is Array:', Array.isArray(inventory));
console.log('Inventory:', JSON.stringify(inventory));

// Test insert
const testItem = {
    id: 'test123',
    name: 'Test Bread',
    quantity: 5,
    category: 'pantry',
    price: 2.99,
    unit: 'pieces'
};

db.insert('inventory', testItem);
console.log('\nAfter insert:');
const inventory2 = db.getCollection('inventory');
console.log('Inventory:', JSON.stringify(inventory2));
console.log('Inventory length:', inventory2.length);

// Check if file was created
const fs = require('fs');
const dbPath = process.env.DB_PATH ? process.env.DB_PATH + '.json' : './smartcart.db.json';
console.log('\nDatabase file path:', dbPath);
console.log('File exists:', fs.existsSync(dbPath));
