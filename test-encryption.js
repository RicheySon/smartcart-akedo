require('dotenv').config();
const encryption = require('./src/utils/encryption');

console.log('Testing encryption...');

const testData = JSON.stringify({ test: 'data', items: [1, 2, 3] });
console.log('Original:', testData);

try {
    const encrypted = encryption.encrypt(testData);
    console.log('Encrypted:', encrypted);
    console.log('Encrypted length:', encrypted ? encrypted.length : 0);

    if (encrypted) {
        const decrypted = encryption.decrypt(encrypted);
        console.log('Decrypted:', decrypted);
        console.log('Match:', testData === decrypted);
    }
} catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
}
