/**
 * @file Tags Controller
 * @description HTTP request handlers for tag-related endpoints.
 * Processes incoming requests and delegates to the tags service.
 * @module modules/tags/controllers/tags
 */

import ApiResponse from '../../../common/response.js';
import toAppException from '../../../common/controllerError.js';
import * as TagsService from '../services/tags.service.js';

/**
 * Controller class for handling tag-related HTTP requests.
 * @class TagsController
 */
class TagsController {
  /**
   * Handles GET request to list all tags.
   * @static
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} [req.query.q] - Optional search term for filtering tags
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with tags array
   */
  static async list(req, res, next) {
    try {
      const tags = await TagsService.listTags(req.query.q);
      return ApiResponse.success(res, tags, 'Tags retrieved');
    } catch (err) {
      next(toAppException(err, 'Error retrieving tags', 'TAGS_LIST_FAILED'));
    }
  }
}

export default TagsController;
