const crypto = require('crypto');
const logger = require('./logger');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16
const KEY_HEX = process.env.ENCRYPTION_KEY;

if (!KEY_HEX || KEY_HEX.length !== 64) {
    logger.warn('Invalid or missing ENCRYPTION_KEY in .env. Using a fallback key for development only. THIS IS NOT SECURE.');
}

// Fallback key for dev safety if .env is messed up (do not use in prod)
const KEY = KEY_HEX && KEY_HEX.length === 64
    ? Buffer.from(KEY_HEX, 'hex')
    : Buffer.from('56cc476aa957b531d05c49d8163d10db2bc2ea43f491c3d10db2b1234567', 'hex');

class EncryptionService {
    encrypt(text) {
        if (!text) return text;
        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
            let encrypted = cipher.update(text);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return iv.toString('hex') + ':' + encrypted.toString('hex');
        } catch (error) {
            logger.error('Encryption failed:', error);
            throw new Error('Encryption failed');
        }
    }

    decrypt(text) {
        if (!text) return text;
        try {
            const textParts = text.split(':');
            if (textParts.length !== 2) return text; // Not encrypted or invalid format

            const iv = Buffer.from(textParts[0], 'hex');
            const encryptedText = Buffer.from(textParts[1], 'hex');
            const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (error) {
            logger.error('Decryption failed:', error);
            // In case of error (e.g. wrong key), return original text or error?
            // For now, returning null to indicate failure
            return null;
        }
    }

    // Object helper: encrypts specific fields in an object
    encryptFields(obj, fields) {
        if (!obj) return obj;
        const newObj = { ...obj };
        fields.forEach(field => {
            if (newObj[field]) {
                newObj[field] = this.encrypt(String(newObj[field]));
            }
        });
        return newObj;
    }

    // Object helper: decrypts specific fields in an object
    decryptFields(obj, fields) {
        if (!obj) return obj;
        const newObj = { ...obj };
        fields.forEach(field => {
            if (newObj[field]) {
                const decrypted = this.decrypt(newObj[field]);
                newObj[field] = decrypted !== null ? decrypted : newObj[field];
            }
        });
        return newObj;
    }
}

module.exports = new EncryptionService();
