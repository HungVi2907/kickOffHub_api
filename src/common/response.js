/**
 * =============================================================================
 * FILE: src/common/response.js
 * =============================================================================
 * 
 * @fileoverview Standardized API Response Helper
 * 
 * @description
 * File này cung cấp helper class để tạo API responses theo format chuẩn.
 * Đảm bảo tất cả responses có cùng cấu trúc nhất quán.
 * 
 * ## Response Format:
 * 
 * ```json
 * {
 *   "success": true,
 *   "message": "OK",
 *   "data": { ... }
 * }
 * ```
 * 
 * ## HTTP Status Codes:
 * | Method    | Default Status | Use Case                    |
 * |-----------|----------------|-----------------------------  |
 * | success() | 200            | GET, PUT, DELETE thành công |
 * | created() | 201            | POST tạo resource mới       |
 * 
 * @module common/response
 * 
 * @example
 * import ApiResponse from './common/response.js';
 * 
 * // Success response
 * ApiResponse.success(res, { user: userData }, 'User retrieved');
 * 
 * // Created response
 * ApiResponse.created(res, { post: newPost }, 'Post created');
 * 
 * =============================================================================
 */

/**
 * API Response helper class
 * 
 * @class ApiResponse
 * @description
 * Cung cấp static methods để tạo standardized API responses.
 * Giúp đảm bảo consistency và giảm code duplication.
 */
export class ApiResponse {
  /**
   * Tạo success response
   * 
   * @static
   * @method success
   * @param {Response} res - Express response object
   * @param {Object} [data={}] - Response data payload
   * @param {string} [message='OK'] - Human-readable message
   * @param {number} [status=200] - HTTP status code
   * @returns {Response} Express response
   * 
   * @example
   * // Basic usage
   * ApiResponse.success(res, { users }, 'Users retrieved');
   * 
   * // Custom status
   * ApiResponse.success(res, { status: 'accepted' }, 'Task queued', 202);
   */
  static success(res, data = {}, message = 'OK', status = 200) {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Tạo created response (HTTP 201)
   * 
   * @static
   * @method created
   * @description
   * Shorthand method cho POST requests tạo resource mới.
   * Tự động set status 201 Created.
   * 
   * @param {Response} res - Express response object
   * @param {Object} [data={}] - Newly created resource data
   * @param {string} [message='Created'] - Success message
   * @returns {Response} Express response
   * 
   * @example
   * ApiResponse.created(res, { post: newPost }, 'Post created successfully');
   */
  static created(res, data = {}, message = 'Created') {
    return ApiResponse.success(res, data, message, 201);
  }
}

export default ApiResponse;
