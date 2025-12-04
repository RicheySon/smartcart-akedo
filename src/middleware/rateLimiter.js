const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests from this IP, please try again later.',
        },
      });
    },
  });
};

const apiRateLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX) || 100
);

module.exports = {
  createRateLimiter,
  apiRateLimiter,
};

