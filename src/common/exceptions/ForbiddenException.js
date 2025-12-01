/**
 * =============================================================================
 * FILE: src/common/exceptions/ForbiddenException.js
 * =============================================================================
 * 
 * @fileoverview Forbidden Exception Class
 * 
 * @description
 * Exception class cho authorization errors.
 * HTTP Status mặc định: 403 Forbidden
 * 
 * ## Khác biệt với AuthException:
 * - 401 (AuthException): Chưa đăng nhập, cần authenticate
 * - 403 (ForbiddenException): Đã đăng nhập nhưng không có quyền
 * 
 * ## Use Cases:
 * - User không có quyền xóa comment của người khác
 * - User không phải admin, không thể access admin routes
 * - Resource thuộc về user khác
 * 
 * @module common/exceptions/ForbiddenException
 * @extends AppException
 * 
 * @example
 * throw new ForbiddenException('Cannot delete others comment', 'NOT_OWNER');
 * throw new ForbiddenException('Admin access required', 'ADMIN_ONLY');
 * 
 * =============================================================================
 */

import AppException from './AppException.js';

/**
 * Forbidden Exception
 * 
 * @class ForbiddenException
 * @extends {AppException}
 * @description
 * Exception khi user không có quyền thực hiện action.
 * Mặc định status 403 Forbidden.
 */
export default class ForbiddenException extends AppException {
  /**
   * Tạo ForbiddenException instance
   * 
   * @constructor
   * @param {string} [message='Forbidden'] - Error message
   * @param {string} [code='FORBIDDEN'] - Error code
   * @param {*} [metadata] - Permission details
   */
  constructor(message = 'Forbidden', code = 'FORBIDDEN', metadata) {
    super(message, code, 403, metadata);
  }
}
