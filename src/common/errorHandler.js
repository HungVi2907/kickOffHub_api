/**
 * =============================================================================
 * FILE: src/common/errorHandler.js
 * =============================================================================
 * 
 * @fileoverview Global Error Handler Middleware
 * 
 * @description
 * File này cung cấp Express error handling middleware.
 * Tất cả errors thrown trong route handlers sẽ được catch ở đây
 * và chuyển thành response format chuẩn.
 * 
 * ## Error Response Format:
 * 
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "message": "Human readable error message",
 *     "code": "ERROR_CODE",
 *     "status": 400,
 *     "details": { ... },
 *     "stack": "..."
 *   }
 * }
 * ```
 * 
 * ## Cách sử dụng trong routes:
 * 
 * ```javascript
 * router.get('/users/:id', async (req, res, next) => {
 *   try {
 *     // ... logic
 *   } catch (err) {
 *     next(err);  // Pass error to this handler
 *   }
 * });
 * ```
 * 
 * @module common/errorHandler
 * @requires ./logger.js
 * 
 * =============================================================================
 */

import { logger } from './logger.js';

/**
 * Global error handling middleware
 * 
 * @function errorHandler
 * @description
 * Express error middleware (4 parameters) - xử lý tất cả errors.
 * Được mount cuối cùng trong middleware chain: app.use(errorHandler)
 * 
 * ## Xử lý Error:
 * 1. Extract status code, error code từ error object
 * 2. Log error với context (path, method)
 * 3. Build error payload phù hợp với environment
 * 4. Send JSON response
 * 
 * ## Production vs Development:
 * - Production: Không include stack trace
 * - Development: Include stack trace để debug
 * 
 * @param {Error} err - Error object được throw hoặc pass qua next()
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} _next - Next middleware (không được sử dụng)
 * 
 * @example
 * // Trong app.js, mount cuối cùng
 * app.use(errorHandler);
 * 
 * // Trong controller, throw error
 * throw new AppException('User not found', 'USER_NOT_FOUND', 404);
 * // Hoặc pass qua next()
 * next(new ValidationException('Invalid email'));
 */
export function errorHandler(err, req, res, _next) {
  // Extract HTTP status code từ error
  // AppException có statusCode, một số errors có status
  const statusCode = err.statusCode || err.status || 500;
  
  // Extract error code cho client-side handling
  const code = err.code || 'INTERNAL_ERROR';
  
  // Kiểm tra environment để quyết định có include sensitive info không
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error với context để debug
  // Pino sẽ serialize error object với stack trace
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled application error');

  // Build error payload
  const errorPayload = {
    message: err.message || 'An unexpected error occurred',
    code,
    status: statusCode,
  };

  // Include additional details nếu có (từ AppException.metadata)
  // Ví dụ: validation errors, field-specific errors
  if (err.metadata) {
    errorPayload.details = err.metadata;
  }

  // Chỉ include stack trace trong development mode
  // Stack trace có thể leak sensitive information trong production
  if (!isProduction && err.stack) {
    errorPayload.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: errorPayload,
  });
}

export default errorHandler;
