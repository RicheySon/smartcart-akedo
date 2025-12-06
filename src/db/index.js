require('dotenv').config();
const fs = require('fs');
const path = require('path');
const encryptionService = require('../utils/encryption');
const logger = require('../utils/logger');

const DB_PATH = process.env.DB_PATH ? process.env.DB_PATH + '.json' : './smartcart.db.json';

class SimpleDb {
    constructor() {
        this.data = {
            inventory: [],
            transactions: [],
            audit_logs: [],
            settings: {}
        };
        this.loaded = false;
    }

    load() {
        if (this.loaded) return;
        try {
            if (fs.existsSync(DB_PATH)) {
                const encryptedContent = fs.readFileSync(DB_PATH, 'utf8');
                // If file is empty or just initialized, handle gracefully
                if (!encryptedContent.trim()) {
                    this.save(); // Write default structure
                } else {
                    // Attempt decrypt
                    // We assume the whole file content is one encrypted string, 
                    // OR we store it as JSON with encrypted fields? 
                    // For maximum privacy: Encrypt the WHOLE file content.
                    // Check if it looks like JSON (unencrypted dev mode) or string (encrypted)
                    if (encryptedContent.trim().startsWith('{') && encryptedContent.includes('"inventory"')) {
                        // It's plain JSON (legacy or first run?)
                        // We should adopt it and encrypt it next time.
                        this.data = JSON.parse(encryptedContent);
                    } else {
                        // Decrypt
                        const decrypted = encryptionService.decrypt(encryptedContent);
                        if (decrypted) {
                            this.data = JSON.parse(decrypted);
                        } else {
                            logger.error('Failed to decrypt database. Starting with empty DB.');
                            // Backup corrupt file?
                            fs.copyFileSync(DB_PATH, DB_PATH + '.bak');
                        }
                    }
                }
            } else {
                this.save();
            }
            this.loaded = true;
            logger.info('Database loaded from ' + DB_PATH);
        } catch (error) {
            logger.error('Error loading database:', error);
            // Init empty
            this.loaded = true;
        }
    }

    save() {
        try {
            const json = JSON.stringify(this.data);
            const encrypted = encryptionService.encrypt(json);
            fs.writeFileSync(DB_PATH, encrypted);
            // logger.debug('Database saved'); // Too verbose
        } catch (error) {
            logger.error('Error saving database:', error);
        }
    }

    // Generic Helpers
    getCollection(name) {
        this.load();
        if (!this.data[name]) {
            this.data[name] = [];
        }
        return this.data[name];
    }

    // CRUD Simulation
    insert(collection, item) {
        this.load();
        if (!this.data[collection]) this.data[collection] = [];
        this.data[collection].push(item);
        this.save();
        return item;
    }

    find(collection, predicate) {
        this.load();
        return (this.data[collection] || []).filter(predicate);
    }

    findOne(collection, predicate) {
        this.load();
        return (this.data[collection] || []).find(predicate);
    }

    update(collection, predicate, updates) {
        this.load();
        const items = this.data[collection] || [];
        const index = items.findIndex(predicate);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
            this.save();
            return items[index];
        }
        return null;
    }

    remove(collection, predicate) {
        this.load();
        const items = this.data[collection] || [];
        const index = items.findIndex(predicate);
        if (index !== -1) {
            const removed = items.splice(index, 1)[0];
            this.save();
            return removed;
        }
        return null;
    }

    // Settings (Key-Value)
    setSetting(key, value) {
        this.load();
        this.data.settings[key] = value;
        this.save();
    }

    getSetting(key) {
        this.load();
        return this.data.settings[key];
    }
}

module.exports = new SimpleDb();
