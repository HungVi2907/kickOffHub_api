import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  listPlayers,
  getPlayerDetails,
  searchPlayers,
  createPlayerRecord,
  updatePlayerRecord,
  removePlayerRecord,
  listPopularPlayers,
  importPlayersFromApi,
  getPlayerStats,
  getPlayersCount,
  PlayersServiceError,
} from '../services/players.service.js';

function mapPlayersError(error, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (error instanceof AppException) {
    return error;
  }

  if (error instanceof PlayersServiceError) {
    return new AppException(error.message, fallbackCode, error.statusCode ?? 400);
  }

  if (error?.response) {
    const status = error.response.status ?? fallbackStatus;
    return new AppException('Error from API Football', fallbackCode, status, {
      response: error.response.data ?? null,
    });
  }

  if (error?.code === 'ECONNABORTED') {
    return new AppException('Timeout when connecting to API Football', 'API_FOOTBALL_TIMEOUT', 504);
  }

  return toAppException(error, fallbackMessage, fallbackCode, fallbackStatus);
}

class PlayersController {
  static async getAllPlayers(req, res, next) {
    try {
      const result = await listPlayers(req.query);
      return ApiResponse.success(res, result, 'Players retrieved successfully');
    } catch (error) {
      next(mapPlayersError(error, 'Error retrieving players list', 'PLAYERS_LIST_FAILED'));
    }
  }

  static async getPlayerById(req, res, next) {
    try {
      const player = await getPlayerDetails(req.params.id);
      return ApiResponse.success(res, player, 'Player retrieved successfully');
    } catch (error) {
      next(mapPlayersError(error, 'Error retrieving player information', 'PLAYER_FETCH_FAILED'));
    }
  }

  static async searchPlayersByName(req, res, next) {
    try {
      const result = await searchPlayers(req.query);
      return ApiResponse.success(res, result, 'Players search completed successfully');
    } catch (error) {
      next(mapPlayersError(error, 'Error searching for players', 'PLAYER_SEARCH_FAILED'));
    }
  }

  static async createPlayer(req, res, next) {
    try {
      const player = await createPlayerRecord(req.body);
      return ApiResponse.created(res, player, 'Player created successfully');
    } catch (error) {
      next(mapPlayersError(error, 'Error creating new player', 'PLAYER_CREATE_FAILED'));
    }
  }

  static async updatePlayer(req, res, next) {
    try {
      const player = await updatePlayerRecord(req.params.id, req.body);
      return ApiResponse.success(res, player, 'Player updated successfully');
    } catch (error) {
      next(mapPlayersError(error, 'Error updating player', 'PLAYER_UPDATE_FAILED'));
    }
  }

  static async deletePlayer(req, res, next) {
    try {
      await removePlayerRecord(req.params.id);
      return ApiResponse.success(
        res,
        { id: Number.parseInt(req.params.id, 10) || req.params.id },
        'Player deleted successfully',
      );
    } catch (error) {
      next(mapPlayersError(error, 'Error deleting player', 'PLAYER_DELETE_FAILED'));
    }
  }

  static async getPopularPlayers(req, res, next) {
    try {
      const result = await listPopularPlayers(req.query);
      return ApiResponse.success(res, result, 'Popular players retrieved successfully');
    } catch (error) {
      next(mapPlayersError(error, 'Error fetching popular players list', 'PLAYER_POPULAR_FAILED'));
    }
  }

  static async importPlayersFromApiFootball(req, res, next) {
    try {
      const result = await importPlayersFromApi(req.query);
      return ApiResponse.success(res, result, 'Players imported successfully');
    } catch (error) {
      next(mapPlayersError(error, 'Error importing players from API Football', 'PLAYER_IMPORT_FAILED'));
    }
  }

  static async getPlayerStatsWithFilters(req, res, next) {
    try {
      const data = await getPlayerStats(req.query);
      return ApiResponse.success(res, data, 'Player statistics retrieved successfully');
    } catch (error) {
      next(mapPlayersError(error, 'Error getting player statistics', 'PLAYER_STATS_FAILED'));
    }
  }

  static async getCount(req, res, next) {
    try {
      const result = await getPlayersCount();
      return ApiResponse.success(res, result, 'Players count retrieved successfully');
    } catch (error) {
      next(mapPlayersError(error, 'Error retrieving players count', 'PLAYERS_COUNT_FAILED'));
    }
  }
}

export default PlayersController;
