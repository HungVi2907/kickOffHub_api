import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  listTeams,
  getTeam,
  getTeamsByLeague,
  createTeam,
  updateTeam,
  deleteTeam,
  searchTeams,
  listPopularTeams,
  importTeams,
  getTeamStats,
} from '../services/teams.service.js';

function readRequestValue(req, key) {
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
    return req.body[key];
  }
  return req.query ? req.query[key] : undefined;
}

function mapTeamsError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
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
    return new AppException(err.message, err.code, err.status || 400, err.details);
  }

  if (err?.response && err.response.data) {
    const status = err.response.status || fallbackStatus;
    return new AppException(fallbackMessage, fallbackCode, status, { response: err.response.data });
  }

  return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
}

const TeamsController = {
  async getAllTeams(req, res, next) {
    try {
      const payload = await listTeams(req.query);
      return ApiResponse.success(res, payload, 'Teams retrieved');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi lấy danh sách teams', 'TEAMS_LIST_FAILED'));
    }
  },

  async getTeamById(req, res, next) {
    try {
      const team = await getTeam(req.params.id);
      return ApiResponse.success(res, team, 'Team retrieved');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi lấy thông tin team', 'TEAM_FETCH_FAILED'));
    }
  },

  async getTeamsByLeague(req, res, next) {
    try {
      const teams = await getTeamsByLeague({ leagueId: req.params.leagueID, season: req.query.season });
      return ApiResponse.success(res, teams, 'Teams by league retrieved');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi lấy teams theo league', 'TEAMS_BY_LEAGUE_FAILED'));
    }
  },

  async createTeam(req, res, next) {
    try {
      const team = await createTeam(req.body);
      return ApiResponse.created(res, team, 'Team created');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi tạo team mới', 'TEAM_CREATE_FAILED'));
    }
  },

  async updateTeam(req, res, next) {
    try {
      const team = await updateTeam(req.params.id, req.body);
      return ApiResponse.success(res, team, 'Team updated');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi cập nhật team', 'TEAM_UPDATE_FAILED'));
    }
  },

  async deleteTeam(req, res, next) {
    try {
      await deleteTeam(req.params.id);
      return ApiResponse.success(
        res,
        { id: Number.parseInt(req.params.id, 10) || req.params.id },
        'Team đã được xóa thành công',
      );
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi xóa team', 'TEAM_DELETE_FAILED'));
    }
  },

  async searchTeamsByName(req, res, next) {
    try {
      const result = await searchTeams(req.query);
      return ApiResponse.success(res, result, 'Kết quả tìm kiếm team');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi tìm kiếm team', 'TEAM_SEARCH_FAILED'));
    }
  },

  async importTeamsFromApiFootball(req, res, next) {
    try {
      const seasonValue = readRequestValue(req, 'season');
      const leagueValue = readRequestValue(req, 'league');
      const backgroundFlag = readRequestValue(req, 'background');
      const result = await importTeams({ season: seasonValue, league: leagueValue, background: backgroundFlag });
      const { queued, ...payload } = result;
      const status = queued ? 202 : 200;
      const message = queued ? 'Tác vụ import đã được đưa vào hàng đợi' : 'Import teams thành công';
      return ApiResponse.success(res, payload, message, status);
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi import teams từ API Football', 'TEAM_IMPORT_FAILED'));
    }
  },

  async getPopularTeams(req, res, next) {
    try {
      const payload = await listPopularTeams(req.query);
      return ApiResponse.success(res, payload, 'Teams phổ biến');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi lấy danh sách teams phổ biến', 'TEAM_POPULAR_FAILED'));
    }
  },

  async getStatsByTeamIdAndSeasonAndLeague(req, res, next) {
    try {
      const stats = await getTeamStats({
        teamId: req.params.teamId ?? req.params.id ?? req.query.teamId,
        leagueId: req.params.leagueId ?? req.params.leagues_id ?? req.query.league,
        season: req.params.season ?? req.query.season,
      });
      return ApiResponse.success(res, stats, 'Thống kê đội bóng');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi lấy thống kê đội bóng', 'TEAM_STATS_FAILED'));
    }
  },
};

export default TeamsController;
