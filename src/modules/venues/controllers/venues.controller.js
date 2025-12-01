/**
 * @file Venues Controller
 * @description HTTP request handlers for venue-related endpoints.
 * Processes incoming requests and delegates to the venues service.
 * @module modules/venues/controllers/venues
 */

import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  listVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  importVenuesFromApi,
} from '../services/venues.service.js';

/**
 * Reads a value from request body or query parameters.
 * @function readRequestValue
 * @param {Object} req - Express request object
 * @param {string} key - Key to read
 * @returns {*} Value from body or query, undefined if not found
 */
function readRequestValue(req, key) {
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
    return req.body[key];
  }
  return req.query ? req.query[key] : undefined;
}

/**
 * Maps errors from the venues service to AppException instances.
 * @function mapVenuesError
 * @param {Error} err - Original error
 * @param {string} fallbackMessage - Default error message
 * @param {string} fallbackCode - Default error code
 * @param {number} [fallbackStatus=500] - Default HTTP status code
 * @returns {AppException} Normalized application exception
 */
function mapVenuesError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (err instanceof AppException) {
    return err;
  }

  if (err?.code && err?.status) {
    return new AppException(err.message, err.code, err.status, err.details);
  }

  if (err?.code === 'ECONNABORTED') {
    return new AppException('Hết thời gian chờ khi gọi API-Football', 'API_FOOTBALL_TIMEOUT', 504);
  }

  if (typeof err?.code === 'string' && (err.code.startsWith('MISSING_') || err.code.startsWith('INVALID_'))) {
    return new AppException(err.message, err.code, 400, err.details);
  }

  if (err?.response && err.response.data) {
    const status = err.response.status || fallbackStatus;
    return new AppException(fallbackMessage, fallbackCode, status, { response: err.response.data });
  }

  return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
}

/**
 * Controller object for handling venue-related HTTP requests.
 * @namespace VenuesController
 */
const VenuesController = {
  /**
   * Handles GET request to list all venues.
   * @async
   * @param {Object} _req - Express request object (unused)
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with venues array
   */
  async getAllVenues(_req, res, next) {
    try {
      const venues = await listVenues();
      return ApiResponse.success(res, venues, 'Venues retrieved');
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi lấy danh sách venues', 'VENUES_LIST_FAILED'));
    }
  },

  /**
   * Handles GET request to retrieve a venue by ID.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Venue ID
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with venue object
   */
  async getVenueById(req, res, next) {
    try {
      const venue = await getVenueById(req.params.id);
      return ApiResponse.success(res, venue, 'Venue retrieved');
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi lấy thông tin venue', 'VENUE_FETCH_FAILED'));
    }
  },

  /**
   * Handles POST request to create a new venue.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.body - Venue data
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with created venue (201 Created)
   */
  async createVenue(req, res, next) {
    try {
      const venue = await createVenue(req.body);
      return ApiResponse.created(res, venue, 'Venue created');
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi tạo venue mới', 'VENUE_CREATE_FAILED'));
    }
  },

  /**
   * Handles PUT request to update an existing venue.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Venue ID
   * @param {Object} req.body - Updated venue data
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with updated venue
   */
  async updateVenue(req, res, next) {
    try {
      const venue = await updateVenue(req.params.id, req.body);
      return ApiResponse.success(res, venue, 'Venue updated');
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi cập nhật venue', 'VENUE_UPDATE_FAILED'));
    }
  },

  /**
   * Handles DELETE request to remove a venue.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Venue ID
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response confirming deletion
   */
  async deleteVenue(req, res, next) {
    try {
      await deleteVenue(req.params.id);
      return ApiResponse.success(
        res,
        { id: Number.parseInt(req.params.id, 10) || req.params.id },
        'Venue đã được xóa thành công',
      );
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi xóa venue', 'VENUE_DELETE_FAILED'));
    }
  },

  /**
   * Handles POST request to import venues from API-Football.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} [req.body] - Request body
   * @param {number} [req.body.id] - Venue ID to import
   * @param {Object} [req.query] - Query parameters
   * @param {number} [req.query.id] - Venue ID to import
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with import result
   */
  async importVenuesFromApiFootball(req, res, next) {
    try {
      const payload = await importVenuesFromApi({ id: readRequestValue(req, 'id') });
      return ApiResponse.success(res, payload, 'Import venues thành công');
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi import venues từ API Football', 'VENUE_IMPORT_FAILED'));
    }
  },
};

export default VenuesController;
