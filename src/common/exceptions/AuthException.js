/**
 * =============================================================================
 * FILE: src/common/exceptions/AuthException.js
 * =============================================================================
 * 
 * @fileoverview Authentication Exception Class
 * 
 * @description
 * Exception class cho authentication errors.
 * HTTP Status mặc định: 401 Unauthorized
 * 
 * ## Use Cases:
 * - Missing authentication token
 * - Invalid/expired JWT token
 * - Invalid credentials (login)
 * - Token blacklisted
 * 
 * ## Error Codes thường dùng:
 * | Code               | Description                    |
 * |--------------------|--------------------------------|
 * | AUTH_TOKEN_MISSING | Không có Authorization header  |
 * | AUTH_TOKEN_EXPIRED | Token đã hết hạn               |
 * | AUTH_INVALID_TOKEN | Token không hợp lệ             |
 * | INVALID_CREDENTIALS| Email/password sai             |
 * 
 * @module common/exceptions/AuthException
 * @extends AppException
 * 
 * @example
 * throw new AuthException('Token expired', 'AUTH_TOKEN_EXPIRED');
 * throw new AuthException('Invalid credentials', 'INVALID_CREDENTIALS');
 * 
 * =============================================================================
 */

import AppException from './AppException.js';

/**
 * Authentication Exception
 * 
 * @class AuthException
 * @extends {AppException}
 * @description
 * Exception cho các lỗi authentication.
 * Mặc định status 401 Unauthorized.
 */
export default class AuthException extends AppException {
  /**
   * Tạo AuthException instance
   * 
   * @constructor
   * @param {string} [message='Unauthorized'] - Error message
   * @param {string} [code='AUTH_ERROR'] - Error code
   * @param {number} [status=401] - HTTP status (thường là 401)
   * @param {*} [metadata] - Additional context
   */
  constructor(message = 'Unauthorized', code = 'AUTH_ERROR', status = 401, metadata) {
    super(message, code, status, metadata);
  }
}
