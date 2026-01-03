/**
 * Function for catching errors in async functions
 * @param {Function} fn - Async function to catch errors from
 * @returns {Function} - middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application
 * @example
 * throw new AppError('User not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { catchAsync, AppError };

import logger from '../utils/logger.mjs';
import { captureException } from '../utils/sentry.mjs';

export const errorHandler = (err, req, res, next) => {
  // Log error with structured logging
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.status || 500,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id || 'anonymous'
  });

  // Send error to Sentry for tracking
  captureException(err, {
    request: {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      query: req.query,
      body: req.body,
    },
    user: req.user ? {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    } : null,
  });
  
  // Handle errors by type
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized access'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'System error occurred. Please try again.' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 