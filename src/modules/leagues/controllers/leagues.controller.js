/**
 * @fileoverview Leagues Controller
 * @description HTTP request handlers for league endpoints. Handles request/response
 * processing, delegates business logic to the service layer, and formats API responses.
 * @module modules/leagues/controllers/leagues
 */

import ApiResponse from '../../../common/response.js';
import toAppException from '../../../common/controllerError.js';
import {
  createLeague,
  fetchLeagueById,
  listLeagues,
  removeLeague,
  searchLeagues,
  updateLeague,
} from '../services/leagues.service.js';

/**
 * Controller class for handling league-related HTTP requests.
 * All methods are static and follow Express middleware signature (req, res, next).
 * @class LeaguesController
 */
class LeaguesController {
  /**
   * Lists all leagues.
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} JSON response with array of leagues
   */
  static async list(req, res, next) {
    try {
      const leagues = await listLeagues();
      return ApiResponse.success(res, leagues, 'Leagues retrieved');
    } catch (err) {
      next(toAppException(err, 'Error retrieving leagues', 'LEAGUES_LIST_FAILED'));
    }
  }

  /**
   * Retrieves a single league by ID.
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {string} req.params.id - League ID from URL parameter
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} JSON response with league details
   */
  static async detail(req, res, next) {
    try {
      const league = await fetchLeagueById(req.params.id);
      return ApiResponse.success(res, league, 'League retrieved');
    } catch (err) {
      next(toAppException(err, 'Error retrieving league', 'LEAGUE_FETCH_FAILED'));
    }
  }

  /**
   * Creates a new league.
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.body - League creation payload
   * @param {number} req.body.id - Unique league identifier
   * @param {string} req.body.name - League name
   * @param {string} [req.body.type] - League type
   * @param {string} [req.body.logo] - Logo URL
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} JSON response with created league (201 status)
   */
  static async create(req, res, next) {
    try {
      const payload = await createLeague(req.body);
      return ApiResponse.created(res, payload, 'League created');
    } catch (err) {
      next(toAppException(err, 'Error creating league', 'LEAGUE_CREATE_FAILED'));
    }
  }

  /**
   * Updates an existing league.
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {string} req.params.id - League ID to update
   * @param {Object} req.body - Update payload
   * @param {string} [req.body.name] - New league name
   * @param {string} [req.body.type] - New league type
   * @param {string} [req.body.logo] - New logo URL
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} JSON response with updated league
   */
  static async update(req, res, next) {
    try {
      const payload = await updateLeague(req.params.id, req.body);
      return ApiResponse.success(res, payload, 'League updated');
    } catch (err) {
      next(toAppException(err, 'Error updating league', 'LEAGUE_UPDATE_FAILED'));
    }
  }

  /**
   * Deletes a league by ID.
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {string} req.params.id - League ID to delete
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} JSON response with deleted league ID
   */
  static async remove(req, res, next) {
    try {
      await removeLeague(req.params.id);
      return ApiResponse.success(
        res,
        { id: Number.parseInt(req.params.id, 10) || req.params.id },
        'League deleted',
      );
    } catch (err) {
      next(toAppException(err, 'Error deleting league', 'LEAGUE_DELETE_FAILED'));
    }
  }

  /**
   * Searches leagues by name with pagination.
   * @static
   * @async
   * @param {import('express').Request} req - Express request object
   * @param {string} req.query.name - Search keyword
   * @param {string} [req.query.limit] - Results per page
   * @param {string} [req.query.page] - Page number
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware function
   * @returns {Promise<void>} JSON response with search results and pagination
   */
  static async search(req, res, next) {
    try {
      const results = await searchLeagues(req.query.name, {
        limit: req.query.limit,
        page: req.query.page,
      });
      return ApiResponse.success(res, results, 'Leagues search results');
    } catch (err) {
      next(toAppException(err, 'Error searching leagues', 'LEAGUES_SEARCH_FAILED'));
    }
  }
}

export default LeaguesController;
