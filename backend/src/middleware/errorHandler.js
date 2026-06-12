const logger = require('../utils/logger');
const apiResponse = require('../utils/apiResponse');

/**
 * Custom application error with HTTP status code.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 handler for unmatched routes.
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

/**
 * Centralized error handler — logs server errors, hides stack in production.
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${message}`, {
      stack: err.stack,
      errors: err.errors,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${message}`);
  }

  return apiResponse.error(
    res,
    statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : message,
    statusCode,
    err.errors || null
  );
};

module.exports = { AppError, notFoundHandler, errorHandler };
