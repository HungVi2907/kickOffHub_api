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

function mapPlayerTeamLeagueSeasonError(error, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (error instanceof AppException) {
    return error;
  }

  if (error instanceof PlayerTeamLeagueSeasonServiceError) {
    return new AppException(error.message, fallbackCode, error.statusCode ?? 400);
  }

  return toAppException(error, fallbackMessage, fallbackCode, fallbackStatus);
}

class PlayerTeamLeagueSeasonController {
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

  static async createMappingRecord(data) {
    return createMappingRecord(data);
  }

  static async updateMapping(req, res, next) {
    try {
      const mapping = await updateMappingRecord(req.params, req.body);
      return ApiResponse.success(res, mapping, 'Mapping updated');
    } catch (error) {
      next(mapPlayerTeamLeagueSeasonError(error, 'Lỗi khi cập nhật bản ghi', 'PLAYER_TEAM_LEAGUE_SEASON_UPDATE_FAILED'));
    }
  }

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
