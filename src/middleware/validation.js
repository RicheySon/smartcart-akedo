const logger = require('../utils/logger');

const validateRequired = (data, fields) => {
  const missing = [];
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.statusCode = 400;
    error.name = 'ValidationError';
    throw error;
  }
};

const validateType = (value, expectedType, fieldName) => {
  const actualType = typeof value;
  if (actualType !== expectedType) {
    const error = new Error(`Invalid type for ${fieldName}: expected ${expectedType}, got ${actualType}`);
    error.statusCode = 400;
    error.name = 'ValidationError';
    throw error;
  }
};

const validateString = (value, fieldName, minLength = 0, maxLength = Infinity) => {
  if (typeof value !== 'string') {
    const error = new Error(`${fieldName} must be a string`);
    error.statusCode = 400;
    error.name = 'ValidationError';
    throw error;
  }
  if (value.length < minLength) {
    const error = new Error(`${fieldName} must be at least ${minLength} characters`);
    error.statusCode = 400;
    error.name = 'ValidationError';
    throw error;
  }
  if (value.length > maxLength) {
    const error = new Error(`${fieldName} must be at most ${maxLength} characters`);
    error.statusCode = 400;
    error.name = 'ValidationError';
    throw error;
  }
};

const validateNumber = (value, fieldName, min = -Infinity, max = Infinity) => {
  if (typeof value !== 'number' || isNaN(value)) {
    const error = new Error(`${fieldName} must be a valid number`);
    error.statusCode = 400;
    error.name = 'ValidationError';
    throw error;
  }
  if (value < min) {
    const error = new Error(`${fieldName} must be at least ${min}`);
    error.statusCode = 400;
    error.name = 'ValidationError';
    throw error;
  }
  if (value > max) {
    const error = new Error(`${fieldName} must be at most ${max}`);
    error.statusCode = 400;
    error.name = 'ValidationError';
    throw error;
  }
};

const validateEmail = (value, fieldName = 'email') => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    const error = new Error(`Invalid ${fieldName} format`);
    error.statusCode = 400;
    error.name = 'ValidationError';
    throw error;
  }
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }
  return sanitized;
};

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) {
        req.body = sanitizeObject(req.body);
        if (schema.body.required) {
          validateRequired(req.body, schema.body.required);
        }
        if (schema.body.fields) {
          for (const [fieldName, fieldSchema] of Object.entries(schema.body.fields)) {
            if (req.body[fieldName] !== undefined) {
              if (fieldSchema.type) {
                validateType(req.body[fieldName], fieldSchema.type, fieldName);
              }
              if (fieldSchema.type === 'string') {
                validateString(
                  req.body[fieldName],
                  fieldName,
                  fieldSchema.minLength,
                  fieldSchema.maxLength
                );
              }
              if (fieldSchema.type === 'number') {
                validateNumber(
                  req.body[fieldName],
                  fieldName,
                  fieldSchema.min,
                  fieldSchema.max
                );
              }
              if (fieldSchema.email) {
                validateEmail(req.body[fieldName], fieldName);
              }
            }
          }
        }
      }

      if (schema.query) {
        req.query = sanitizeObject(req.query);
        if (schema.query.required) {
          validateRequired(req.query, schema.query.required);
        }
      }

      if (schema.params) {
        req.params = sanitizeObject(req.params);
        if (schema.params.required) {
          validateRequired(req.params, schema.params.required);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validateRequired,
  validateType,
  validateString,
  validateNumber,
  validateEmail,
  sanitizeString,
  sanitizeObject,
  validateRequest,
};

