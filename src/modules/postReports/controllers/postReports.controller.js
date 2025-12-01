/**
 * @file Post Reports Controller
 * @description HTTP request handlers for post report-related endpoints.
 * Processes incoming requests and delegates to the post reports service.
 * @module modules/postReports/controllers/postReports
 */

import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import { reportPost } from '../services/postReports.service.js';

/**
 * Maps errors from the post reports service to AppException instances.
 * @function mapPostReportsError
 * @param {Error} err - Original error
 * @param {string} fallbackMessage - Default error message
 * @param {string} fallbackCode - Default error code
 * @param {number} [fallbackStatus=500] - Default HTTP status code
 * @returns {AppException} Normalized application exception
 */
function mapPostReportsError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (err instanceof AppException) {
    return err;
  }

  if (err?.statusCode || err?.status) {
    return new AppException(err.message, err.code || fallbackCode, err.statusCode ?? err.status ?? 400, err.details);
  }

  return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
}

/**
 * Controller class for handling post report-related HTTP requests.
 * @class PostReportsController
 */
class PostReportsController {
  /**
   * Handles POST request to report a post.
   * @static
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Post ID
   * @param {Object} req.user - Authenticated user object
   * @param {number} req.user.id - User ID
   * @param {Object} req.body - Request body
   * @param {string} [req.body.reason] - Optional reason for the report
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with report result (201 Created)
   */
  static async report(req, res, next) {
    // TEMPORARILY DISABLED - Report feature is inactive
    // Original implementation preserved below:
    // try {
    //   const result = await reportPost(req.params.id, req.user?.id, req.body.reason);
    //   return ApiResponse.created(res, result, 'Report received');
    // } catch (err) {
    //   next(mapPostReportsError(err, 'Unable to report post', 'POST_REPORT_FAILED'));
    // }
    
    // Return disabled message - no DB operations performed
    return ApiResponse.success(res, null, 'The report feature is currently disabled.');
  }
}

export default PostReportsController;
