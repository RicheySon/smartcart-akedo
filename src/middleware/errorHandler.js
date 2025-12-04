const logger = require('../utils/logger');

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const getStatusCode = (error) => {
  if (error.statusCode) {
    return error.statusCode;
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return 400;
  }

  if (error.name === 'UnauthorizedError' || error.message?.includes('unauthorized')) {
    return 401;
  }

  if (error.message?.includes('forbidden')) {
    return 403;
  }

  if (error.message?.includes('not found')) {
    return 404;
  }

  return 500;
};

const errorHandler = (err, req, res, next) => {
  const statusCode = getStatusCode(err);
  const isDevelopment = process.env.NODE_ENV === 'development';

  logger.error('Error occurred:', {
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    statusCode,
    path: req.path,
    method: req.method,
  });

  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(isDevelopment && { stack: err.stack }),
    },
  };

  if (statusCode === 500 && !isDevelopment) {
    errorResponse.error.message = 'Internal Server Error';
  }

  res.status(statusCode).json(errorResponse);
};

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.path}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler,
};

