const db = require('./index');
const logger = require('../utils/logger');

const initSchema = async () => {
    // Just ensure loaded
    db.load();
    logger.info('Database initialized (File-based Encrypted Storage)');
    return true;
};

module.exports = initSchema;
