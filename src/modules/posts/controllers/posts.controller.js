/**
 * @fileoverview Posts Controller - Xử lý HTTP requests cho bài viết
 * 
 * Controller này nhận requests từ routes, gọi service layer để xử lý
 * logic nghiệp vụ, và trả về responses theo format chuẩn.
 * 
 * Tất cả errors được catch và transform thành AppException trước khi
 * trả về client để đảm bảo format response nhất quán.
 * 
 * @module modules/posts/controllers/posts.controller
 * @requires ../../../common/response.js - API response formatter
 * @requires ../../../common/exceptions/index.js - Custom exception classes
 * @requires ../../../common/controllerError.js - Error transformer utility
 * @requires ../services/posts.service.js - Business logic layer
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import ApiResponse from '../../../common/response.js';
import { AppException, NotFoundException, ValidationException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  createPostWithImage,
  getPostById,
  listPosts,
  removePost,
  updatePostWithImage,
} from '../services/posts.service.js';

/**
 * Chuyển đổi error thành AppException phù hợp
 * 
 * Xử lý các loại lỗi:
 * - AppException: Giữ nguyên
 * - 'INVALID_ID' message: Chuyển thành ValidationException
 * - Lỗi khác: Chuyển thành AppException với thông tin fallback
 * 
 * @private
 * @function mapPostsError
 * @param {Error} err - Error cần transform
 * @param {string} fallbackMessage - Message mặc định nếu không xác định được lỗi
 * @param {string} fallbackCode - Error code mặc định
 * @param {number} [fallbackStatus=500] - HTTP status mặc định
 * @returns {AppException} Transformed exception
 * 
 * @example
 * catch (err) {
 *   next(mapPostsError(err, 'Error creating post', 'POST_CREATE_FAILED'));
 * }
 */
function mapPostsError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  // Nếu đã là AppException, giữ nguyên
  if (err instanceof AppException) {
    return err;
  }

  // Handle lỗi INVALID_ID từ service
  if (err?.message === 'INVALID_ID') {
    return new ValidationException('Post ID is invalid', 'POST_ID_INVALID');
  }

  // Fallback: Chuyển thành AppException generic
  return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
}

/**
 * Posts Controller Object
 * 
 * Chứa các handler methods cho từng endpoint của Posts API.
 * Mỗi method follow pattern: try-catch với error forwarding qua next().
 * 
 * @namespace PostsController
 */
const PostsController = {
  /**
   * Lấy danh sách bài viết có phân trang
   * 
   * @async
   * @function list
   * @memberof PostsController
   * @param {express.Request} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} [req.query.page] - Số trang (default: 1)
   * @param {string} [req.query.limit] - Số bài mỗi trang (default: 10, max: 50)
   * @param {express.Response} res - Express response object
   * @param {express.NextFunction} next - Express next middleware
   * @returns {Promise<void>} JSON response với paginated posts
   * 
   * @example
   * // GET /api/posts?page=2&limit=20
   * // Response: { success: true, data: { total, page, pageSize, data: [...] } }
   */
  async list(req, res, next) {
    try {
      // Lấy params từ query string
      const page = req.query.page;
      const limit = req.query.limit;
      
      // Gọi service để lấy dữ liệu
      const payload = await listPosts(page, limit);
      
      return ApiResponse.success(res, payload, 'Posts retrieved');
    } catch (err) {
      next(mapPostsError(err, 'Error retrieving posts', 'POSTS_LIST_FAILED'));
    }
  },

  /**
   * Lấy chi tiết một bài viết theo ID
   * 
   * @async
   * @function detail
   * @memberof PostsController
   * @param {express.Request} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - ID của bài viết
   * @param {express.Response} res - Express response object
   * @param {express.NextFunction} next - Express next middleware
   * @returns {Promise<void>} JSON response với post detail
   * @throws {NotFoundException} Nếu post không tồn tại
   * 
   * @example
   * // GET /api/posts/123
   * // Response: { success: true, data: { id, title, content, ... } }
   */
  async detail(req, res, next) {
    try {
      const post = await getPostById(req.params.id);
      
      // Throw NotFoundException nếu không tìm thấy
      if (!post) {
        throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
      }
      
      return ApiResponse.success(res, post, 'Post retrieved');
    } catch (err) {
      next(mapPostsError(err, 'Error retrieving post', 'POST_FETCH_FAILED'));
    }
  },

  /**
   * Tạo bài viết mới
   * 
   * Yêu cầu authentication. Nhận multipart/form-data với optional image.
   * User ID được lấy từ req.user (set bởi auth middleware).
   * 
   * @async
   * @function create
   * @memberof PostsController
   * @param {express.Request} req - Express request object
   * @param {Object} req.user - Authenticated user (from auth middleware)
   * @param {number} req.user.id - User ID
   * @param {Object} req.body - Request body
   * @param {string} req.body.title - Tiêu đề bài viết
   * @param {string} req.body.content - Nội dung bài viết
   * @param {'public'|'draft'} [req.body.status] - Trạng thái
   * @param {string[]} [req.body.tags] - Mảng tags
   * @param {Object} [req.file] - Uploaded image file (from multer)
   * @param {express.Response} res - Express response object
   * @param {express.NextFunction} next - Express next middleware
   * @returns {Promise<void>} JSON response với created post (201 Created)
   * 
   * @example
   * // POST /api/posts (multipart/form-data)
   * // Body: { title, content, status?, tags?, image? }
   * // Response: { success: true, data: { id, title, ... } }
   */
  async create(req, res, next) {
    try {
      // Gọi service với userId từ auth, body, và optional file
      const post = await createPostWithImage(req.user.id, req.body, req.file);
      
      // Trả về 201 Created
      return ApiResponse.created(res, post, 'Post created');
    } catch (err) {
      next(mapPostsError(err, 'Error creating post', 'POST_CREATE_FAILED'));
    }
  },

  /**
   * Cập nhật bài viết
   * 
   * Yêu cầu authentication. Hỗ trợ partial update và image management.
   * 
   * @async
   * @function update
   * @memberof PostsController
   * @param {express.Request} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - ID bài viết cần update
   * @param {Object} req.body - Request body với fields cần update
   * @param {Object} [req.file] - New image file (optional)
   * @param {express.Response} res - Express response object
   * @param {express.NextFunction} next - Express next middleware
   * @returns {Promise<void>} JSON response với updated post
   * @throws {NotFoundException} Nếu post không tồn tại
   * 
   * @example
   * // PATCH /api/posts/123 (multipart/form-data)
   * // Body: { title?, content?, removeImage?, image? }
   */
  async update(req, res, next) {
    try {
      const post = await updatePostWithImage(req.params.id, req.body, req.file);
      
      // Throw NotFoundException nếu không tìm thấy
      if (!post) {
        throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
      }
      
      return ApiResponse.success(res, post, 'Post updated');
    } catch (err) {
      next(mapPostsError(err, 'Error updating post', 'POST_UPDATE_FAILED'));
    }
  },

  /**
   * Xóa bài viết
   * 
   * Yêu cầu authentication. Xóa post, tags junction, và Cloudinary image.
   * 
   * @async
   * @function remove
   * @memberof PostsController
   * @param {express.Request} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - ID bài viết cần xóa
   * @param {express.Response} res - Express response object
   * @param {express.NextFunction} next - Express next middleware
   * @returns {Promise<void>} JSON response với deleted post ID
   * @throws {NotFoundException} Nếu post không tồn tại
   * 
   * @example
   * // DELETE /api/posts/123
   * // Response: { success: true, data: { id: 123 }, message: 'Post deleted' }
   */
  async remove(req, res, next) {
    try {
      const deleted = await removePost(req.params.id);
      
      // Throw NotFoundException nếu không tìm thấy
      if (!deleted) {
        throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
      }
      
      // Trả về ID của post đã xóa
      return ApiResponse.success(
        res,
        { id: Number.parseInt(req.params.id, 10) || req.params.id },
        'Post deleted',
      );
    } catch (err) {
      next(mapPostsError(err, 'Error deleting post', 'POST_DELETE_FAILED'));
    }
  },
};

export default PostsController;
