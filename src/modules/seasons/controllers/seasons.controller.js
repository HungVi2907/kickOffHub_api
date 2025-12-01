/**
 * @file Seasons Controller
 * @description HTTP request handlers for season-related endpoints.
 * Handles listing, creating, and deleting seasons.
 * @module modules/seasons/controllers/seasons
 */

import ApiResponse from '../../../common/response.js';
import toAppException from '../../../common/controllerError.js';
import {
  createSeasonEntry,
  listSeasons,
  removeSeason,
} from '../services/seasons.service.js';

/**
 * Controller class for handling season-related HTTP requests.
 * All methods are static and follow Express middleware signature.
 * @class SeasonsController
 */
class SeasonsController {
  /**
   * Lists all available seasons.
   * Retrieves seasons ordered from most recent to oldest.
   *
   * @static
   * @async
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   * @param {import('express').NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} Sends JSON response with array of seasons.
   * @throws {AppException} Forwards error to error handler if retrieval fails.
   */
  static async list(req, res, next) {
    try {
      const seasons = await listSeasons();
      return ApiResponse.success(res, seasons, 'Seasons retrieved');
    } catch (err) {
      next(toAppException(err, 'Error retrieving seasons', 'SEASONS_LIST_FAILED'));
    }
  }

  /**
   * Creates a new season entry.
   * If the season already exists, returns the existing entry without error.
   *
   * @static
   * @async
   * @param {import('express').Request} req - Express request object.
   * @param {Object} req.body - Request body containing season data.
   * @param {number} req.body.season - The season year to create.
   * @param {import('express').Response} res - Express response object.
   * @param {import('express').NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} Sends JSON response with created/existing season.
   *   Returns 201 status if created, 200 if already existed.
   * @throws {AppException} Forwards error to error handler if creation fails.
   */
  static async create(req, res, next) {
    try {
      const { season, created } = await createSeasonEntry(req.body);

      // Set appropriate message and status based on whether season was newly created
      const message = created ? 'Season created' : 'Season already exists';
      const status = created ? 201 : 200;

      return ApiResponse.success(res, season, message, status);
    } catch (err) {
      next(toAppException(err, 'Error creating season', 'SEASON_CREATE_FAILED'));
    }
  }

  /**
   * Removes a season from the database.
   *
   * @static
   * @async
   * @param {import('express').Request} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.season - The season year to delete.
   * @param {import('express').Response} res - Express response object.
   * @param {import('express').NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} Sends JSON response confirming deletion.
   * @throws {AppException} Forwards error to error handler if deletion fails.
   */
  static async remove(req, res, next) {
    try {
      await removeSeason(req.params.season);

      // Return the deleted season value in the response
      return ApiResponse.success(
        res,
        { season: Number.parseInt(req.params.season, 10) || req.params.season },
        'Season đã được xóa thành công',
      );
    } catch (err) {
      next(toAppException(err, 'Error deleting season', 'SEASON_DELETE_FAILED'));
    }
  }
}

export default SeasonsController;
