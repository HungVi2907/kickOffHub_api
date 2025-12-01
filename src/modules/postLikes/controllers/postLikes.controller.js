/**
 * @file Post Likes Controller
 * @description HTTP request handlers for post like-related endpoints.
 * Processes incoming requests and delegates to the post likes service.
 * @module modules/postLikes/controllers/postLikes
 */

import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import { getLikeSummary, toggleLike } from '../services/postLikes.service.js';

/**
 * Maps errors from the post likes service to AppException instances.
 * @function mapPostLikesError
 * @param {Error} err - Original error
 * @param {string} fallbackMessage - Default error message
 * @param {string} fallbackCode - Default error code
 * @param {number} [fallbackStatus=500] - Default HTTP status code
 * @returns {AppException} Normalized application exception
 */
function mapPostLikesError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (err instanceof AppException) {
    return err;
  }

  if (err?.statusCode || err?.status) {
    return new AppException(err.message, err.code || fallbackCode, err.statusCode || err.status, err.details);
  }

  return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
}

/**
 * Controller class for handling post like-related HTTP requests.
 * @class PostLikesController
 */
class PostLikesController {
  /**
   * Handles POST request to toggle like on a post.
   * @static
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Post ID
   * @param {Object} req.user - Authenticated user object
   * @param {number} req.user.id - User ID
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with like toggle result
   */
  static async toggle(req, res, next) {
    try {
      const result = await toggleLike(req.params.id, req.user?.id);
      return ApiResponse.success(res, result, 'Post like toggled');
    } catch (err) {
      next(mapPostLikesError(err, 'Unable to toggle like', 'POST_LIKE_TOGGLE_FAILED'));
    }
  }

  /**
   * Handles GET request to retrieve like summary for a post.
   * @static
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Post ID
   * @param {Object} [req.user] - Authenticated user object (optional)
   * @param {number} [req.user.id] - User ID
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with like summary
   */
  static async summary(req, res, next) {
    try {
      const result = await getLikeSummary(req.params.id, req.user?.id);
      return ApiResponse.success(res, result, 'Post like summary');
    } catch (err) {
      next(mapPostLikesError(err, 'Unable to retrieve like summary', 'POST_LIKE_SUMMARY_FAILED'));
    }
  }
}

export default PostLikesController;
