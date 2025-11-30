import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  LeagueTeamSeasonValidationError,
  listMappings,
  listTeamsForLeagueSeason,
  removeMapping,
} from '../services/leagueTeamSeason.service.js';

function mapLeagueTeamSeasonError(error, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (error instanceof AppException) {
    return error;
  }

  if (error instanceof LeagueTeamSeasonValidationError || error?.statusCode) {
    return new AppException(error.message, fallbackCode, error.statusCode ?? 400);
  }

  return toAppException(error, fallbackMessage, fallbackCode, fallbackStatus);
}

class LeagueTeamSeasonController {
  static async list(req, res, next) {
    try {
      const records = await listMappings(req.query);
      return ApiResponse.success(res, records, 'League-team-season mappings retrieved');
    } catch (err) {
      next(mapLeagueTeamSeasonError(err, 'Invalid query parameters', 'LEAGUE_TEAM_SEASON_LIST_FAILED'));
    }
  }

  static async listTeams(req, res, next) {
    try {
      const teams = await listTeamsForLeagueSeason(req.params.leagueId, req.params.season);
      return ApiResponse.success(res, teams, 'Teams for league/season retrieved');
    } catch (err) {
      next(mapLeagueTeamSeasonError(err, 'Error retrieving teams for league season', 'LEAGUE_TEAM_SEASON_TEAMS_FAILED'));
    }
  }

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
