/**
 * @file League-Team-Season Controller
 * @description HTTP request handlers for league-team-season endpoints.
 *              Handles listing mappings, retrieving teams, and removing associations.
 * @module modules/leagueTeamSeason/controllers/leagueTeamSeason
 */

import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  LeagueTeamSeasonValidationError,
  listMappings,
  listTeamsForLeagueSeason,
  removeMapping,
} from '../services/leagueTeamSeason.service.js';

/**
 * Maps service errors to AppException for consistent error responses.
 *
 * @function mapLeagueTeamSeasonError
 * @param {Error} error - The original error
 * @param {string} fallbackMessage - Default message if error type is unknown
 * @param {string} fallbackCode - Default error code
 * @param {number} [fallbackStatus=500] - Default HTTP status code
 * @returns {AppException} Normalized application exception
 * @private
 */
function mapLeagueTeamSeasonError(error, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (error instanceof AppException) {
    return error;
  }

  if (error instanceof LeagueTeamSeasonValidationError || error?.statusCode) {
    return new AppException(error.message, fallbackCode, error.statusCode ?? 400);
  }

  return toAppException(error, fallbackMessage, fallbackCode, fallbackStatus);
}

/**
 * Controller class for League-Team-Season HTTP endpoints.
 * Provides static methods for handling REST API requests.
 *
 * @class LeagueTeamSeasonController
 */
class LeagueTeamSeasonController {
  /**
   * Lists league-team-season mappings with optional filtering.
   *
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.query - Query parameters for filtering
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with mappings or passes error to next
   */
  static async list(req, res, next) {
    try {
      const records = await listMappings(req.query);
      return ApiResponse.success(res, records, 'League-team-season mappings retrieved');
    } catch (err) {
      next(mapLeagueTeamSeasonError(err, 'Invalid query parameters', 'LEAGUE_TEAM_SEASON_LIST_FAILED'));
    }
  }

  /**
   * Lists teams for a specific league and season.
   *
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.params - URL parameters
   * @param {string} req.params.leagueId - League identifier
   * @param {string} req.params.season - Season year
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response with teams or passes error to next
   */
  static async listTeams(req, res, next) {
    try {
      const teams = await listTeamsForLeagueSeason(req.params.leagueId, req.params.season);
      return ApiResponse.success(res, teams, 'Teams for league/season retrieved');
    } catch (err) {
      next(mapLeagueTeamSeasonError(err, 'Error retrieving teams for league season', 'LEAGUE_TEAM_SEASON_TEAMS_FAILED'));
    }
  }

  /**
   * Removes a league-team-season mapping.
   *
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.params - URL parameters
   * @param {string} req.params.leagueId - League identifier
   * @param {string} req.params.teamId - Team identifier
   * @param {string} req.params.season - Season year
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} Sends JSON response confirming deletion or passes error to next
   */
  static async remove(req, res, next) {
    try {
      await removeMapping(req.params.leagueId, req.params.teamId, req.params.season);
      return ApiResponse.success(
        res,
        {
          leagueId: Number.parseInt(req.params.leagueId, 10) || req.params.leagueId,
          teamId: Number.parseInt(req.params.teamId, 10) || req.params.teamId,
          season: Number.parseInt(req.params.season, 10) || req.params.season,
        },
        'Record has been successfully deleted',
      );
    } catch (err) {
      next(mapLeagueTeamSeasonError(err, 'Error removing mapping', 'LEAGUE_TEAM_SEASON_DELETE_FAILED'));
    }
  }
}

export default LeagueTeamSeasonController;
