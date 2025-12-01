/**
 * =============================================================================
 * FILE: src/common/exceptions/ConflictException.js
 * =============================================================================
 * 
 * @fileoverview Conflict Exception Class
 * 
 * @description
 * Exception class cho resource conflict errors.
 * HTTP Status mặc định: 409 Conflict
 * 
 * ## Use Cases:
 * - Email đã được sử dụng (duplicate)
 * - Username đã tồn tại
 * - Resource đã được tạo trước đó
 * - Concurrent modification conflict
 * 
 * @module common/exceptions/ConflictException
 * @extends AppException
 * 
 * @example
 * throw new ConflictException('Email already exists', 'EMAIL_EXISTS');
 * throw new ConflictException('Username taken', 'USERNAME_TAKEN', { username });
 * 
 * =============================================================================
 */

import AppException from './AppException.js';

/**
 * Conflict Exception
 * 
 * @class ConflictException
 * @extends {AppException}
 * @description
 * Exception khi có resource conflict (duplicate, etc.).
 * Mặc định status 409 Conflict.
 */
export default class ConflictException extends AppException {
  /**
   * Tạo ConflictException instance
   * 
   * @constructor
   * @param {string} [message='Conflict'] - Error message
   * @param {string} [code='CONFLICT'] - Error code
   * @param {*} [metadata] - Conflict details
   */
  constructor(message = 'Conflict', code = 'CONFLICT', metadata) {
    super(message, code, 409, metadata);
  }
}
