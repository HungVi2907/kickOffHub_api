/**
 * @fileoverview Comments Controller
 * @module modules/comments/controllers/comments
 * @description HTTP Request Handler cho Comments API.
 *              Xử lý các request từ client, gọi service layer và format response.
 *              Chuyển đổi các business errors thành HTTP responses phù hợp.
 *
 * @requires ../../../common/response.js - Standardized API response utilities
 * @requires ../../../common/exceptions/index.js - Custom exception classes
 * @requires ../../../common/controllerError.js - Error transformation utility
 * @requires ../services/comments.service.js - Business logic layer
 *
 * @author KickOffHub Team
 * @version 1.0.0
 */

import ApiResponse from '../../../common/response.js';
import {
  AppException,
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  createCommentForPost,
  removeCommentFromPost,
} from '../services/comments.service.js';

/**
 * Chuyển đổi service errors thành HTTP exceptions phù hợp.
 * Map các error codes từ service layer sang các exception classes tương ứng.
 *
 * @function mapCommentsError
 * @param {Error} err - Error object từ service layer
 * @param {string} fallbackMessage - Thông báo mặc định nếu không match error code
 * @param {string} fallbackCode - Mã lỗi mặc định
 * @param {number} [fallbackStatus=500] - HTTP status code mặc định
 * @returns {AppException} Exception instance phù hợp với loại lỗi
 * @private
 *
 * @example
 * // Error mapping examples:
 * // 'INVALID_POST_ID' -> ValidationException (400)
 * // 'POST_NOT_FOUND' -> NotFoundException (404)
 * // 'NOT_ALLOWED' -> ForbiddenException (403)
 */
function mapCommentsError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  // Nếu đã là AppException thì trả về trực tiếp
  if (err instanceof AppException) {
    return err;
  }

  // Map error message sang exception type tương ứng
  switch (err?.message) {
    // Validation errors -> 400 Bad Request
    case 'INVALID_POST_ID':
    case 'INVALID_COMMENT_ID':
    case 'INVALID_USER_ID':
      return new ValidationException('Invalid identifier', fallbackCode);

    // Not found errors -> 404 Not Found
    case 'POST_NOT_FOUND':
    case 'COMMENT_NOT_FOUND':
      return new NotFoundException('Comment resource not found', fallbackCode);

    // Authorization errors -> 403 Forbidden
    case 'NOT_ALLOWED':
      return new ForbiddenException('You cannot remove this comment', fallbackCode);

    // Các lỗi khác -> Sử dụng fallback
    default:
      return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
  }
}

/**
 * Comments Controller Object
 * @namespace CommentsController
 * @description Controller object chứa các handler methods cho Comments API endpoints.
 */
const CommentsController = {
  /**
   * Tạo comment mới trên bài viết.
   * Xử lý POST /api/posts/:postId/comments
   *
   * @async
   * @function create
   * @memberof CommentsController
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.postId - ID của bài viết
   * @param {Object} req.body - Request body
   * @param {string} req.body.content - Nội dung comment (5-500 ký tự)
   * @param {Object} req.user - Authenticated user từ auth middleware
   * @param {number} req.user.id - ID của người dùng hiện tại
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware
   * @returns {Promise<void>} Response 201 với comment data hoặc error
   */
  async create(req, res, next) {
    try {
      // Gọi service để tạo comment
      const comment = await createCommentForPost(req.params.postId, req.user.id, req.body.content);

      // Trả về response 201 Created với comment data
      return ApiResponse.created(res, comment, 'Comment created');
    } catch (err) {
      // Chuyển error sang middleware error handler
      next(mapCommentsError(err, 'Unable to create comment', 'COMMENT_CREATE_FAILED'));
    }
  },

  /**
   * Xóa comment khỏi bài viết.
   * Xử lý DELETE /api/posts/:postId/comments/:commentId
   * Chỉ tác giả của comment mới có quyền xóa.
   *
   * @async
   * @function remove
   * @memberof CommentsController
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.postId - ID của bài viết
   * @param {string} req.params.commentId - ID của comment cần xóa
   * @param {Object} req.user - Authenticated user từ auth middleware
   * @param {number} req.user.id - ID của người dùng hiện tại
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware
   * @returns {Promise<void>} Response 200 với confirmation hoặc error
   */
  async remove(req, res, next) {
    try {
      // Gọi service để xóa comment
      await removeCommentFromPost(req.params.postId, req.params.commentId, req.user.id);

      // Trả về response 200 OK với thông tin đã xóa
      return ApiResponse.success(
        res,
        {
          postId: Number.parseInt(req.params.postId, 10) || req.params.postId,
          commentId: Number.parseInt(req.params.commentId, 10) || req.params.commentId,
        },
        'Comment removed',
      );
    } catch (err) {
      // Chuyển error sang middleware error handler
      next(mapCommentsError(err, 'Unable to remove comment', 'COMMENT_DELETE_FAILED'));
    }
  },
};

export default CommentsController;
