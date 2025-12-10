const crypto = require('crypto');
const logger = require('./logger');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16
const KEY_ENV = process.env.ENCRYPTION_KEY;

// If a proper 64-hex char key is provided, use it. Otherwise derive a 32-byte key
// from the provided string (or a fallback) using SHA-256 so key length is valid.
let KEY;
if (KEY_ENV && KEY_ENV.length === 64 && /^[0-9a-fA-F]+$/.test(KEY_ENV)) {
    KEY = Buffer.from(KEY_ENV, 'hex');
} else {
    if (!KEY_ENV) {
        logger.warn('Missing ENCRYPTION_KEY in environment. Using a development fallback key. THIS IS NOT SECURE.');
    } else {
        logger.warn('Invalid ENCRYPTION_KEY length or format; deriving key via SHA-256 for compatibility.');
    }
    const crypto = require('crypto');
    const seed = KEY_ENV || 'smartcart-dev-fallback-key-please-set-env-var';
    KEY = crypto.createHash('sha256').update(seed).digest();
}

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
