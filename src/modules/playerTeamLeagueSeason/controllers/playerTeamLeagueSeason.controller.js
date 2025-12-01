/**
 * @file Player-Team-League-Season Controller
 * @description HTTP request handlers for player-team-league-season endpoints.
 *              Handles CRUD operations for player-team-league-season mappings.
 * @module modules/playerTeamLeagueSeason/controllers/playerTeamLeagueSeason
 */

import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  createMapping,
  createMappingRecord,
  deleteMappingRecord,
  findPlayersByFilters,
  updateMappingRecord,
  PlayerTeamLeagueSeasonServiceError,
} from '../services/playerTeamLeagueSeason.service.js';

/**
 * Maps service errors to AppException for consistent error responses.
 *
 * @function mapPlayerTeamLeagueSeasonError
 * @param {Error} error - The original error
 * @param {string} fallbackMessage - Default message if error type is unknown
 * @param {string} fallbackCode - Default error code
 * @param {number} [fallbackStatus=500] - Default HTTP status code
 * @returns {AppException} Normalized application exception
 * @private
 */
function mapPlayerTeamLeagueSeasonError(error, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (error instanceof AppException) {
    return error;
  }

  if (error instanceof PlayerTeamLeagueSeasonServiceError) {
    return new AppException(error.message, fallbackCode, error.statusCode ?? 400);
  }

  return toAppException(error, fallbackMessage, fallbackCode, fallbackStatus);
}

/**
 * Controller class for Player-Team-League-Season HTTP endpoints.
 * Provides static methods for handling REST API requests.
 *
 * @class PlayerTeamLeagueSeasonController
 */
class PlayerTeamLeagueSeasonController {
  /**
   * Creates a new player-team-league-season mapping.
   *
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.body - Request body with mapping data
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with created mapping or passes error to next
   */
  static async createMapping(req, res, next) {
    try {
      const payload = await createMapping(req.body);
      return ApiResponse.created(res, payload, 'Mapping created');
    } catch (error) {
      next(
        mapPlayerTeamLeagueSeasonError(
          error,
          'Lỗi khi tạo bản ghi cầu thủ-đội-giải-mùa',
          'PLAYER_TEAM_LEAGUE_SEASON_CREATE_FAILED',
        ),
      );
    }
  }

  /**
   * Creates a mapping record (internal use).
   *
   * @static
   * @async
   * @param {Object} data - Mapping data
   * @returns {Promise<Object>} Created mapping record
   */
  static async createMappingRecord(data) {
    return createMappingRecord(data);
  }

  /**
   * Updates an existing player-team-league-season mapping.
   *
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.params - URL parameters with composite key
   * @param {Object} req.body - Request body with update data
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with updated mapping or passes error to next
   */
  static async updateMapping(req, res, next) {
    try {
      const mapping = await updateMappingRecord(req.params, req.body);
      return ApiResponse.success(res, mapping, 'Mapping updated');
    } catch (error) {
      next(mapPlayerTeamLeagueSeasonError(error, 'Lỗi khi cập nhật bản ghi', 'PLAYER_TEAM_LEAGUE_SEASON_UPDATE_FAILED'));
    }
  }

  /**
   * Deletes a player-team-league-season mapping.
   *
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.params - URL parameters with composite key
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response confirming deletion or passes error to next
   */
  static async deleteMapping(req, res, next) {
    try {
      await deleteMappingRecord(req.params);
      return ApiResponse.success(
        res,
        { ...req.params },
        'Mapping deleted',
      );
    } catch (error) {
      next(mapPlayerTeamLeagueSeasonError(error, 'Lỗi khi xóa bản ghi', 'PLAYER_TEAM_LEAGUE_SEASON_DELETE_FAILED'));
    }
  }

  /**
   * Finds players by team, league, and season filters.
   *
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.query - Query parameters with filter criteria
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with filtered players or passes error to next
   */
  static async findPlayersByTeamLeagueSeason(req, res, next) {
    try {
      const payload = await findPlayersByFilters(req.query);
      return ApiResponse.success(res, payload, 'Players retrieved for mapping filters');
    } catch (error) {
      next(
        mapPlayerTeamLeagueSeasonError(
          error,
          'Lỗi khi tìm cầu thủ theo đội và giải đấu',
          'PLAYER_TEAM_LEAGUE_SEASON_SEARCH_FAILED',
        ),
      );
    }
  }
}

export default PlayerTeamLeagueSeasonController;
