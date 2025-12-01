/**
 * =============================================================================
 * FILE: src/common/exceptions/ValidationException.js
 * =============================================================================
 * 
 * @fileoverview Validation Exception Class
 * 
 * @description
 * Exception class cho validation errors.
 * HTTP Status mặc định: 400 Bad Request
 * 
 * ## Use Cases:
 * - Request body validation failed
 * - Query parameter validation failed
 * - File upload validation failed
 * - Business rule validation failed
 * 
 * ## Metadata Format:
 * ```javascript
 * {
 *   issues: [
 *     { field: 'email', message: 'Email is invalid' },
 *     { field: 'password', message: 'Password too short' }
 *   ]
 * }
 * ```
 * 
 * @module common/exceptions/ValidationException
 * @extends AppException
 * 
 * @example
 * throw new ValidationException('Invalid email format', 'INVALID_EMAIL');
 * 
 * throw new ValidationException('Validation failed', 'VALIDATION_ERROR', {
 *   issues: [{ field: 'email', message: 'Invalid format' }]
 * });
 * 
 * =============================================================================
 */

import AppException from './AppException.js';

/**
 * Validation Exception
 * 
 * @class ValidationException
 * @extends {AppException}
 * @description
 * Exception cho các lỗi validation.
 * Mặc định status 400 Bad Request.
 */
export default class ValidationException extends AppException {
  /**
   * Tạo ValidationException instance
   * 
   * @constructor
   * @param {string} [message='Validation failed'] - Error message
   * @param {string} [code='VALIDATION_ERROR'] - Error code
   * @param {*} [metadata] - Validation details (fields, issues)
   */
  constructor(message = 'Validation failed', code = 'VALIDATION_ERROR', metadata) {
    super(message, code, 400, metadata);
  }
}
