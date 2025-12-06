require('dotenv').config();
const db = require('./src/db/index');
const encryptionService = require('./src/utils/encryption');

// Test Encryption
const testText = "Secret Groceries";
const encrypted = encryptionService.encrypt(testText);
const decrypted = encryptionService.decrypt(encrypted);

console.log('Encryption Test:');
console.log(`Original: ${testText}`);
console.log(`Encrypted: ${encrypted}`);
console.log(`Decrypted: ${decrypted}`);

if (testText === decrypted) {
    console.log('✅ Encryption Service works!');
} else {
    console.error('❌ Encryption Service failed!');
    process.exit(1);
}

// Test DB
try {
    db.load();
    console.log('✅ Database Loaded!');

    // Test Insert
    const testId = 'test_' + Date.now();
    db.insert('inventory', { id: testId, name: 'Test Item', quantity: 1 });
    console.log('✅ Inserted Item');

    // Test Find
    const item = db.findOne('inventory', i => i.id === testId);
    if (item && item.name === 'Test Item') {
        console.log('✅ Found Item');
    } else {
        console.error('❌ Item not found!');
        process.exit(1);
    }

    // Manual Cleanup
    db.remove('inventory', i => i.id === testId);
    console.log('✅ Cleaned up test item');

    console.log('✅ Storage Verification Complete!');

} catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
}
