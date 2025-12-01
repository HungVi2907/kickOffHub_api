/**
 * =============================================================================
 * FILE: src/common/exceptions/NotFoundException.js
 * =============================================================================
 * 
 * @fileoverview Not Found Exception Class
 * 
 * @description
 * Exception class cho resource not found errors.
 * HTTP Status mặc định: 404 Not Found
 * 
 * ## Use Cases:
 * - User ID không tồn tại
 * - Post không tìm thấy
 * - Team ID không hợp lệ
 * - Route không tồn tại
 * 
 * @module common/exceptions/NotFoundException
 * @extends AppException
 * 
 * @example
 * throw new NotFoundException('User not found', 'USER_NOT_FOUND');
 * throw new NotFoundException('Post not found', 'POST_NOT_FOUND', { postId: 123 });
 * 
 * =============================================================================
 */

import AppException from './AppException.js';

/**
 * Not Found Exception
 * 
 * @class NotFoundException
 * @extends {AppException}
 * @description
 * Exception khi resource không tìm thấy.
 * Mặc định status 404 Not Found.
 */
export default class NotFoundException extends AppException {
  /**
   * Tạo NotFoundException instance
   * 
   * @constructor
   * @param {string} [message='Resource not found'] - Error message
   * @param {string} [code='NOT_FOUND'] - Error code
   * @param {*} [metadata] - Resource identifier details
   */
  constructor(message = 'Resource not found', code = 'NOT_FOUND', metadata) {
    super(message, code, 404, metadata);
  }
}
