/**
 * @fileoverview Teams Controller
 * @description Controller layer xử lý các HTTP requests cho Teams module.
 * Controller nhận requests từ routes, gọi service layer để xử lý business logic,
 * và format response trả về cho client.
 * 
 * @module modules/teams/controllers/teams.controller
 * @requires ../../../common/response.js - API response formatter
 * @requires ../../../common/exceptions/index.js - Custom exception classes
 * @requires ../../../common/controllerError.js - Error mapping utility
 * @requires ../services/teams.service.js - Teams business logic
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

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

/**
 * Đọc giá trị từ request body hoặc query
 * 
 * @function readRequestValue
 * @private
 * @description Utility để lấy giá trị từ body trước, fallback sang query.
 * Hữu ích cho các endpoints hỗ trợ cả POST body và GET query params.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {string} key - Tên key cần lấy giá trị
 * 
 * @returns {*} Giá trị của key từ body hoặc query, undefined nếu không có
 */
function readRequestValue(req, key) {
  // Ưu tiên body nếu có key
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
    return req.body[key];
  }
  // Fallback sang query params
  return req.query ? req.query[key] : undefined;
}

/**
 * Map errors từ service sang AppException
 * 
 * @function mapTeamsError
 * @private
 * @description Chuẩn hóa các loại error thành AppException để middleware xử lý.
 * Xử lý nhiều loại error: AppException, service errors, API errors, timeout.
 * 
 * @param {Error} err - Error object từ service
 * @param {string} fallbackMessage - Message mặc định nếu không map được
 * @param {string} fallbackCode - Error code mặc định
 * @param {number} [fallbackStatus=500] - HTTP status mặc định
 * 
 * @returns {AppException} Chuẩn hóa thành AppException
 */
function mapTeamsError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  // Đã là AppException, return luôn
  if (err instanceof AppException) {
    return err;
  }

  // Service error với code và status
  if (err?.code && err?.status) {
    return new AppException(err.message, err.code, err.status, err.details);
  }

  // Axios timeout error
  if (err?.code === 'ECONNABORTED') {
    return new AppException('Hết thời gian chờ khi gọi API-Football', 'API_FOOTBALL_TIMEOUT', 504);
  }

  // Validation errors (MISSING_*, INVALID_*)
  if (typeof err?.code === 'string' && (err.code.startsWith('MISSING_') || err.code.startsWith('INVALID_'))) {
    return new AppException(err.message, err.code, err.status || 400, err.details);
  }

  // Axios response error
  if (err?.response && err.response.data) {
    const status = err.response.status || fallbackStatus;
    return new AppException(fallbackMessage, fallbackCode, status, { response: err.response.data });
  }

  // Fallback: convert unknown error
  return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
}

/**
 * Teams Controller Object
 * @description Object chứa các handler methods cho Teams API endpoints
 * @type {Object}
 */
const TeamsController = {
  /**
   * Lấy danh sách tất cả teams
   * 
   * @async
   * @function getAllTeams
   * @description GET /api/teams - Lấy danh sách teams với phân trang
   * 
   * @param {import('express').Request} req - Express request
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.page=1] - Số trang
   * @param {number} [req.query.limit=20] - Số items mỗi trang
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Express next middleware
   * 
   * @returns {Promise<void>} JSON response với danh sách teams và pagination
   */
  async getAllTeams(req, res, next) {
    try {
      const payload = await listTeams(req.query);
      return ApiResponse.success(res, payload, 'Teams retrieved');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi lấy danh sách teams', 'TEAMS_LIST_FAILED'));
    }
  },

  /**
   * Lấy thông tin một team theo ID
   * 
   * @async
   * @function getTeamById
   * @description GET /api/teams/:id - Lấy chi tiết một team
   * 
   * @param {import('express').Request} req - Express request
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Team ID
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Express next middleware
   * 
   * @returns {Promise<void>} JSON response với team data
   */
  async getTeamById(req, res, next) {
    try {
      const team = await getTeam(req.params.id);
      return ApiResponse.success(res, team, 'Team retrieved');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi lấy thông tin team', 'TEAM_FETCH_FAILED'));
    }
  },

  /**
   * Lấy danh sách teams theo league
   * 
   * @async
   * @function getTeamsByLeague
   * @description GET /api/teams/league/:leagueID - Lấy teams thuộc một league
   * 
   * @param {import('express').Request} req - Express request
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.leagueID - League ID
   * @param {Object} req.query - Query parameters
   * @param {string} [req.query.season] - Filter theo season
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Express next middleware
   * 
   * @returns {Promise<void>} JSON response với mảng teams
   */
  async getTeamsByLeague(req, res, next) {
    try {
      const teams = await getTeamsByLeague({ leagueId: req.params.leagueID, season: req.query.season });
      return ApiResponse.success(res, teams, 'Teams by league retrieved');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi lấy teams theo league', 'TEAMS_BY_LEAGUE_FAILED'));
    }
  },

  /**
   * Tạo team mới
   * 
   * @async
   * @function createTeam
   * @description POST /api/teams - Tạo một team mới
   * 
   * @param {import('express').Request} req - Express request
   * @param {Object} req.body - Request body với team data
   * @param {string} req.body.name - Tên team (bắt buộc)
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Express next middleware
   * 
   * @returns {Promise<void>} JSON response với team đã tạo (201 Created)
   */
  async createTeam(req, res, next) {
    try {
      const team = await createTeam(req.body);
      return ApiResponse.created(res, team, 'Team created');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi tạo team mới', 'TEAM_CREATE_FAILED'));
    }
  },

  /**
   * Cập nhật team
   * 
   * @async
   * @function updateTeam
   * @description PUT /api/teams/:id - Cập nhật thông tin team
   * 
   * @param {import('express').Request} req - Express request
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Team ID cần cập nhật
   * @param {Object} req.body - Fields cần cập nhật
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Express next middleware
   * 
   * @returns {Promise<void>} JSON response với team đã cập nhật
   */
  async updateTeam(req, res, next) {
    try {
      const team = await updateTeam(req.params.id, req.body);
      return ApiResponse.success(res, team, 'Team updated');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi cập nhật team', 'TEAM_UPDATE_FAILED'));
    }
  },

  /**
   * Xóa team
   * 
   * @async
   * @function deleteTeam
   * @description DELETE /api/teams/:id - Xóa một team
   * 
   * @param {import('express').Request} req - Express request
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Team ID cần xóa
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Express next middleware
   * 
   * @returns {Promise<void>} JSON response xác nhận đã xóa
   */
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

  /**
   * Tìm kiếm teams theo tên
   * 
   * @async
   * @function searchTeamsByName
   * @description GET /api/teams/search - Tìm kiếm teams với keyword
   * 
   * @param {import('express').Request} req - Express request
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.name - Từ khóa tìm kiếm
   * @param {number} [req.query.limit=20] - Số kết quả tối đa
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Express next middleware
   * 
   * @returns {Promise<void>} JSON response với kết quả tìm kiếm
   */
  async searchTeamsByName(req, res, next) {
    try {
      const result = await searchTeams(req.query);
      return ApiResponse.success(res, result, 'Kết quả tìm kiếm team');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi tìm kiếm team', 'TEAM_SEARCH_FAILED'));
    }
  },

  /**
   * Import teams từ API-Football
   * 
   * @async
   * @function importTeamsFromApiFootball
   * @description POST /api/teams/import - Import teams từ external API
   * 
   * @param {import('express').Request} req - Express request
   * @param {Object} req.body - Request body
   * @param {number} req.body.season - Season year (bắt buộc)
   * @param {number} req.body.league - League ID (bắt buộc)
   * @param {boolean} [req.body.background=false] - Chạy trong background queue
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Express next middleware
   * 
   * @returns {Promise<void>} JSON response với kết quả import (200 sync, 202 queued)
   */
  async importTeamsFromApiFootball(req, res, next) {
    try {
      // Đọc params từ body hoặc query để linh hoạt hơn
      const seasonValue = readRequestValue(req, 'season');
      const leagueValue = readRequestValue(req, 'league');
      const backgroundFlag = readRequestValue(req, 'background');
      
      const result = await importTeams({ season: seasonValue, league: leagueValue, background: backgroundFlag });
      
      // Destructure để loại bỏ queued flag khỏi response payload
      const { queued, ...payload } = result;
      
      // Return 202 Accepted nếu đã queue, 200 OK nếu sync
      const status = queued ? 202 : 200;
      const message = queued ? 'Tác vụ import đã được đưa vào hàng đợi' : 'Import teams thành công';
      return ApiResponse.success(res, payload, message, status);
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi import teams từ API Football', 'TEAM_IMPORT_FAILED'));
    }
  },

  /**
   * Lấy danh sách teams phổ biến
   * 
   * @async
   * @function getPopularTeams
   * @description GET /api/teams/popular - Lấy các teams được đánh dấu phổ biến
   * 
   * @param {import('express').Request} req - Express request
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.page=1] - Số trang
   * @param {number} [req.query.limit=20] - Số items mỗi trang
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Express next middleware
   * 
   * @returns {Promise<void>} JSON response với danh sách popular teams
   */
  async getPopularTeams(req, res, next) {
    try {
      const payload = await listPopularTeams(req.query);
      return ApiResponse.success(res, payload, 'Teams phổ biến');
    } catch (err) {
      next(mapTeamsError(err, 'Lỗi khi lấy danh sách teams phổ biến', 'TEAM_POPULAR_FAILED'));
    }
  },

  /**
   * Lấy thống kê đội bóng
   * 
   * @async
   * @function getStatsByTeamIdAndSeasonAndLeague
   * @description GET /api/teams/:teamId/stats/:leagueId/:season - Lấy thống kê từ API-Football
   * 
   * @param {import('express').Request} req - Express request
   * @param {Object} req.params - Route parameters (nhiều format được hỗ trợ)
   * @param {string} [req.params.teamId] - Team ID
   * @param {string} [req.params.leagueId] - League ID
   * @param {string} [req.params.season] - Season year
   * @param {Object} req.query - Query parameters (fallback)
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Express next middleware
   * 
   * @returns {Promise<void>} JSON response với statistics data
   */
  async getStatsByTeamIdAndSeasonAndLeague(req, res, next) {
    try {
      // Hỗ trợ nhiều format route params để linh hoạt
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
