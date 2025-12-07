const db = require('../db/index');
const logger = require('../utils/logger');

class VendorService {
    constructor() {
        // defaults
    }

    _getLists() {
        const lists = db.getSetting('vendor_lists');
        return lists || { allowed: [], blocked: [] };
    }

    _saveLists(lists) {
        db.setSetting('vendor_lists', lists);
    }

    addToAllowlist(vendorName) {
        const lists = this._getLists();
        const vendor = vendorName.toLowerCase().trim();

        if (!lists.allowed.includes(vendor)) {
            lists.allowed.push(vendor);
            // Remove from blocked if present
            lists.blocked = lists.blocked.filter(v => v !== vendor);
            this._saveLists(lists);
            logger.info(`Vendor allowed: ${vendorName}`);
        }
        return lists;
    }

    blockVendor(vendorName) {
        const lists = this._getLists();
        const vendor = vendorName.toLowerCase().trim();

        if (!lists.blocked.includes(vendor)) {
            lists.blocked.push(vendor);
            // Remove from allowed if present
            lists.allowed = lists.allowed.filter(v => v !== vendor);
            this._saveLists(lists);
            logger.info(`Vendor blocked: ${vendorName}`);
        }
        return lists;
    }

    isVendorAllowed(vendorName) {
        const lists = this._getLists();
        const vendor = vendorName.toLowerCase().trim();

        // Logic: If blocklist exists, check it first. 
        // If allowlist exists (and is not empty), vendor MUST be in it.
        // Default (empty lists) = Allowed.

        if (lists.blocked.includes(vendor)) return false;

        if (lists.allowed.length > 0) {
            return lists.allowed.includes(vendor);
        }

        return true; // Default allow
    }

    getAllowedVendors() {
        return this._getLists().allowed;
    }

    getBlockedVendors() {
        return this._getLists().blocked;
    }
}

module.exports = new VendorService();
