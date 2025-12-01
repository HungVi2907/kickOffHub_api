/**
 * =============================================================================
 * FILE: src/common/exceptions/AppException.js
 * =============================================================================
 * 
 * @fileoverview Base Application Exception Class
 * 
 * @description
 * Class này là base exception cho tất cả application errors.
 * Các exception types khác (ValidationException, AuthException, etc.)
 * đều extend từ class này.
 * 
 * ## Properties:
 * | Property   | Type   | Description                               |
 * |------------|--------|-------------------------------------------|
 * | message    | string | Human-readable error message              |
 * | code       | string | Machine-readable error code               |
 * | status     | number | HTTP status code                          |
 * | statusCode | number | Alias cho status (compatibility)          |
 * | metadata   | any    | Additional error details (validation, etc)|
 * 
 * @module common/exceptions/AppException
 * 
 * @example
 * throw new AppException('User not found', 'USER_NOT_FOUND', 404);
 * 
 * throw new AppException('Invalid data', 'VALIDATION_ERROR', 400, {
 *   fields: ['email', 'password']
 * });
 * 
 * =============================================================================
 */

/**
 * Base Application Exception
 * 
 * @class AppException
 * @extends {Error}
 * @description
 * Base class cho tất cả application exceptions.
 * Cung cấp standardized error format với:
 * - Error code cho programmatic handling
 * - HTTP status code
 * - Optional metadata cho additional context
 */
export default class AppException extends Error {
  /**
   * Tạo AppException instance
   * 
   * @constructor
   * @param {string} [message='Application error'] - Human-readable error message
   * @param {string} [code='APP_ERROR'] - Machine-readable error code
   * @param {number} [status=500] - HTTP status code
   * @param {*} [metadata=null] - Additional error context/details
   * 
   * @example
   * new AppException('Resource not found', 'NOT_FOUND', 404);
   * new AppException('Validation failed', 'VALIDATION', 400, { errors: [...] });
   */
  constructor(message = 'Application error', code = 'APP_ERROR', status = 500, metadata = null) {
    // Call parent constructor với message
    super(message);
    
    // Set error name để identify exception type
    this.name = this.constructor.name;
    
    // Machine-readable error code
    // Sử dụng cho client-side error handling
    this.code = code;
    
    // HTTP status code
    this.status = status;
    
    // Alias cho compatibility với một số libraries
    this.statusCode = status;
    
    // Additional metadata (validation errors, resource IDs, etc.)
    this.metadata = metadata;
    
    // Capture stack trace nếu available (V8 engines)
    // Loại bỏ constructor frame khỏi stack trace
    Error.captureStackTrace?.(this, this.constructor);
  }
}
