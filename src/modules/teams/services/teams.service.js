/**
 * @fileoverview Teams Service
 * @description Business logic layer cho quản lý đội bóng (Teams).
 * Service này xử lý tất cả logic nghiệp vụ liên quan đến teams bao gồm:
 * - CRUD operations cho teams
 * - Tìm kiếm và phân trang
 * - Import teams từ API-Football
 * - Lấy thống kê đội bóng
 * 
 * @module modules/teams/services/teams.service
 * @requires ../../apiFootball/services/apiFootball.service.js - Client gọi API-Football
 * @requires ../repositories/team.repository.js - Repository layer cho Team
 * @requires ../repositories/leagueTeamSeason.repository.js - Repository cho mapping league-team-season
 * @requires ../queues/teamImport.queue.js - Background job queue
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { apiFootballGet } from '../../apiFootball/services/apiFootball.service.js';
import {
  paginateTeams,
  findTeamById,
  findTeamsByIds,
  searchTeamsByName,
  createTeamRecord,
  updateTeamRecord,
  deleteTeamRecord,
  bulkUpsertTeams,
} from '../repositories/team.repository.js';
import {
  findMappingsByLeagueAndSeason,
  upsertLeagueTeamSeason,
} from '../repositories/leagueTeamSeason.repository.js';
import { enqueueTeamImportJob } from '../queues/teamImport.queue.js';

/**
 * Giá trị mặc định cho page number trong pagination
 * @constant {number}
 */
const DEFAULT_PAGE = 1;

/**
 * Giá trị mặc định cho số items mỗi trang
 * @constant {number}
 */
const DEFAULT_LIMIT = 20;

/**
 * Giới hạn tối đa cho kết quả tìm kiếm
 * @constant {number}
 */
const MAX_SEARCH_LIMIT = 100;

/**
 * Bảng mã lỗi và thông báo tương ứng (tiếng Việt)
 * @constant {Object.<string, string>}
 * @description Map từ error code sang message để dễ maintain và i18n
 */
const ERROR_MESSAGES = {
  INVALID_PAGE: 'Giá trị page phải là số nguyên dương',
  INVALID_LIMIT: 'Giá trị limit phải là số nguyên dương',
  INVALID_TEAM_ID: 'ID team không hợp lệ',
  TEAM_NOT_FOUND: 'Team không tồn tại',
  INVALID_LEAGUE_ID: 'leagueID không hợp lệ',
  INVALID_SEASON: 'season không hợp lệ',
  NO_LEAGUE_MAPPINGS: 'Không tìm thấy đội bóng cho leagueID đã cung cấp',
  NO_TEAMS_FOR_LEAGUE: 'Không tìm thấy đội bóng trong cơ sở dữ liệu cho leagueID này',
  INVALID_TEAM_NAME: 'Tên đội bóng không hợp lệ',
  INVALID_SEARCH_LIMIT: 'Giá trị limit không hợp lệ (1-100)',
  MISSING_SEASON: 'season là bắt buộc',
  MISSING_LEAGUE: 'league là bắt buộc',
  INVALID_IDS: 'ID không hợp lệ',
  API_FOOTBALL_ERROR: 'Không thể lấy thống kê đội bóng từ API-Football',
  API_FOOTBALL_TIMEOUT: 'Hết thời gian chờ khi gọi API-Football',
};

/**
 * Tạo Error object với code và status
 * 
 * @function createError
 * @private
 * @description Factory function tạo Error object chuẩn hóa với code, status và details
 * 
 * @param {string} code - Mã lỗi (key trong ERROR_MESSAGES hoặc custom message)
 * @param {number} [status=400] - HTTP status code
 * @param {*} [details] - Chi tiết bổ sung về lỗi
 * 
 * @returns {Error} Error object với các thuộc tính code, status, details
 */
function createError(code, status = 400, details) {
  const error = new Error(ERROR_MESSAGES[code] || code);
  error.code = code;
  error.status = status;
  if (details) {
    error.details = details;
  }
  return error;
}

/**
 * Parse giá trị thành số nguyên dương hoặc trả về default
 * 
 * @function parsePositiveIntOrDefault
 * @private
 * @description Utility function để parse và validate số nguyên dương từ input.
 * Hỗ trợ string và number input.
 * 
 * @param {string|number|null|undefined} value - Giá trị cần parse
 * @param {number} defaultValue - Giá trị mặc định nếu input empty
 * 
 * @returns {number|null} Số nguyên dương đã parse, defaultValue nếu empty, null nếu invalid
 */
function parsePositiveIntOrDefault(value, defaultValue) {
  // Trả về default nếu value không tồn tại
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  // Xử lý string rỗng
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return defaultValue;
  }
  
  // Parse thành integer và validate
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null; // Invalid value
  }
  return parsed;
}

/**
 * Parse và validate số nguyên dương bắt buộc
 * 
 * @function parseRequiredPositiveInt
 * @private
 * @description Parse giá trị bắt buộc, throw error nếu invalid
 * 
 * @param {string|number} value - Giá trị cần parse
 * @param {string} code - Error code nếu validation thất bại
 * 
 * @returns {number} Số nguyên dương đã parse
 * @throws {Error} Nếu giá trị không phải số nguyên dương
 */
function parseRequiredPositiveInt(value, code) {
  const parsed = parsePositiveIntOrDefault(value, null);
  if (parsed === null) {
    throw createError(code);
  }
  return parsed;
}

/**
 * Parse số nguyên dương tùy chọn
 * 
 * @function parseOptionalPositiveInt
 * @private
 * @description Parse giá trị optional, throw error nếu có giá trị nhưng invalid
 * 
 * @param {string|number|null|undefined} value - Giá trị cần parse
 * 
 * @returns {number|undefined} Số đã parse hoặc undefined nếu không có giá trị
 * @throws {Error} Nếu có giá trị nhưng không phải số nguyên dương
 */
function parseOptionalPositiveInt(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createError('INVALID_SEASON');
  }
  return parsed;
}

/**
 * Chuẩn hóa string field
 * 
 * @function normalizeStringField
 * @private
 * @description Trim và convert empty string thành null
 * 
 * @param {*} value - Giá trị cần chuẩn hóa
 * 
 * @returns {string|null} String đã trim hoặc null
 */
function normalizeStringField(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Chuyển đổi giá trị thành number hoặc null
 * 
 * @function coerceNumberOrNull
 * @private
 * @description Dùng cho các field số optional như founded, venue_id
 * 
 * @param {*} value - Giá trị cần convert
 * 
 * @returns {number|null} Number nếu valid, null nếu không
 */
function coerceNumberOrNull(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Parse integer từ API response
 * 
 * @function parseApiInteger
 * @private
 * @description Xử lý giá trị số từ API-Football response
 * 
 * @param {*} value - Giá trị từ API response
 * 
 * @returns {number|null} Integer đã parse hoặc null
 */
function parseApiInteger(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

/**
 * Build team payload từ API-Football response
 * 
 * @function buildTeamPayloadFromApi
 * @private
 * @description Transform dữ liệu từ API-Football sang format phù hợp với database schema
 * 
 * @param {Object} entry - Entry từ API-Football response
 * @param {Object} entry.team - Thông tin team
 * @param {Object} [entry.venue] - Thông tin venue (sân vận động)
 * 
 * @returns {Object|null} Team payload hoặc null nếu dữ liệu không hợp lệ
 */
function buildTeamPayloadFromApi(entry) {
  const team = entry?.team;
  if (!team) {
    return null;
  }
  
  // Validate team ID - bắt buộc phải có
  const teamId = parseApiInteger(team.id);
  if (!teamId) {
    return null;
  }
  
  // Build payload với các field đã normalize
  const payload = {
    id: teamId,
    name: normalizeStringField(team.name),
    code: normalizeStringField(team.code),
    country: normalizeStringField(team.country),
    founded: parseApiInteger(team.founded),
    national: Boolean(team.national),
    logo: normalizeStringField(team.logo),
    venue_id: parseApiInteger(entry?.venue?.id), // Lấy venue_id từ venue object
  };
  
  // Team name là bắt buộc
  if (!payload.name) {
    return null;
  }
  return payload;
}

/**
 * Escape các ký tự đặc biệt cho LIKE query
 * 
 * @function escapeForLike
 * @private
 * @description Escape % và _ để tránh SQL injection trong LIKE clause
 * 
 * @param {string} value - String cần escape
 * 
 * @returns {string} String đã được escape
 */
function escapeForLike(value) {
  return value.replace(/[%_]/g, '\\$&');
}

/**
 * Kiểm tra flag background có phải true không
 * 
 * @function isBackgroundFlagTrue
 * @private
 * @description Xử lý nhiều format của boolean flag (boolean, string "true", etc)
 * 
 * @param {boolean|string|*} value - Giá trị cần kiểm tra
 * 
 * @returns {boolean} True nếu flag được set là true
 */
function isBackgroundFlagTrue(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

/**
 * Lấy danh sách teams với phân trang
 * 
 * @async
 * @function listTeams
 * @description Trả về danh sách teams được phân trang, sắp xếp theo tên A-Z.
 * 
 * @param {Object} [params={}] - Query parameters
 * @param {number|string} [params.page=1] - Số trang (1-based)
 * @param {number|string} [params.limit=20] - Số items mỗi trang
 * 
 * @returns {Promise<Object>} Response object với data và pagination info
 * @returns {Team[]} returns.data - Mảng các team objects
 * @returns {Object} returns.pagination - Thông tin phân trang
 * @returns {number} returns.pagination.totalItems - Tổng số teams
 * @returns {number} returns.pagination.totalPages - Tổng số trang
 * @returns {number} returns.pagination.page - Trang hiện tại
 * @returns {number} returns.pagination.limit - Số items mỗi trang
 * 
 * @throws {Error} INVALID_PAGE - Nếu page không phải số nguyên dương
 * @throws {Error} INVALID_LIMIT - Nếu limit không phải số nguyên dương
 * 
 * @example
 * const result = await listTeams({ page: 1, limit: 10 });
 * // { data: [...], pagination: { totalItems: 100, totalPages: 10, page: 1, limit: 10 } }
 */
export async function listTeams(params = {}) {
  // Parse và validate page parameter
  const pageNumber = parsePositiveIntOrDefault(params.page, DEFAULT_PAGE);
  if (pageNumber === null) {
    throw createError('INVALID_PAGE');
  }

  // Parse và validate limit parameter
  const limitNumber = parsePositiveIntOrDefault(params.limit, DEFAULT_LIMIT);
  if (limitNumber === null) {
    throw createError('INVALID_LIMIT');
  }

  // Query database với pagination
  const { rows, count } = await paginateTeams({ page: pageNumber, limit: limitNumber });
  
  // Build response với pagination metadata
  return {
    data: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limitNumber),
      page: pageNumber,
      limit: limitNumber,
    },
  };
}

/**
 * Lấy thông tin chi tiết một team
 * 
 * @async
 * @function getTeam
 * @description Tìm và trả về thông tin team theo ID.
 * 
 * @param {number|string} teamIdRaw - ID của team cần lấy
 * 
 * @returns {Promise<Team>} Team object
 * 
 * @throws {Error} INVALID_TEAM_ID - Nếu ID không hợp lệ
 * @throws {Error} TEAM_NOT_FOUND (404) - Nếu không tìm thấy team
 * 
 * @example
 * const team = await getTeam(33);
 * // { id: 33, name: 'Manchester United', ... }
 */
export async function getTeam(teamIdRaw) {
  const teamId = parseRequiredPositiveInt(teamIdRaw, 'INVALID_TEAM_ID');
  const team = await findTeamById(teamId);
  if (!team) {
    throw createError('TEAM_NOT_FOUND', 404);
  }
  return team;
}

/**
 * Lấy danh sách teams theo league
 * 
 * @async
 * @function getTeamsByLeague
 * @description Tìm tất cả teams thuộc một league, có thể filter theo season.
 * Sử dụng bảng mapping league_team_season để xác định quan hệ.
 * 
 * @param {Object} params - Query parameters
 * @param {number|string} params.leagueId - ID của league (bắt buộc)
 * @param {number|string} [params.season] - Season year để filter (optional)
 * 
 * @returns {Promise<Team[]>} Mảng các team objects thuộc league
 * 
 * @throws {Error} INVALID_LEAGUE_ID - Nếu leagueId không hợp lệ
 * @throws {Error} INVALID_SEASON - Nếu season có nhưng không hợp lệ
 * @throws {Error} NO_LEAGUE_MAPPINGS (404) - Không có mapping cho league/season
 * @throws {Error} NO_TEAMS_FOR_LEAGUE (404) - Không tìm thấy teams trong database
 * 
 * @example
 * // Lấy tất cả teams của Premier League
 * const teams = await getTeamsByLeague({ leagueId: 39 });
 * 
 * @example
 * // Lấy teams của Premier League mùa 2023
 * const teams = await getTeamsByLeague({ leagueId: 39, season: 2023 });
 */
export async function getTeamsByLeague(params) {
  const leagueId = parseRequiredPositiveInt(params.leagueId, 'INVALID_LEAGUE_ID');
  
  // Parse season nếu có
  let parsedSeason;
  if (params.season !== undefined) {
    parsedSeason = parseOptionalPositiveInt(params.season);
  }

  // Tìm các mapping league-team-season
  const mappings = await findMappingsByLeagueAndSeason(leagueId, parsedSeason);
  if (mappings.length === 0) {
    throw createError('NO_LEAGUE_MAPPINGS', 404);
  }

  // Extract unique team IDs từ mappings
  const teamIds = [...new Set(mappings.map((entry) => entry.teamId))];
  
  // Lấy thông tin teams từ database
  const teams = await findTeamsByIds(teamIds);
  if (teams.length === 0) {
    throw createError('NO_TEAMS_FOR_LEAGUE', 404);
  }
  return teams;
}

/**
 * Tạo team mới
 * 
 * @async
 * @function createTeam
 * @description Tạo một team mới trong database.
 * 
 * @param {Object} payload - Dữ liệu team
 * @param {string} payload.name - Tên đội bóng (bắt buộc)
 * @param {string|null} [payload.code] - Mã viết tắt
 * @param {string|null} [payload.country] - Quốc gia
 * @param {number|null} [payload.founded] - Năm thành lập
 * @param {boolean} [payload.national=false] - Đội tuyển quốc gia
 * @param {string|null} [payload.logo] - URL logo
 * @param {number|null} [payload.venue_id] - ID sân vận động
 * 
 * @returns {Promise<Team>} Team object đã được tạo
 * 
 * @throws {Error} INVALID_TEAM_NAME - Nếu tên team trống hoặc không hợp lệ
 * 
 * @example
 * const team = await createTeam({
 *   name: 'New Team FC',
 *   country: 'Vietnam',
 *   founded: 2020
 * });
 */
export async function createTeam(payload) {
  // Validate và sanitize tên team
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (!name) {
    throw createError('INVALID_TEAM_NAME');
  }

  // Build sanitized payload với default values
  const sanitizedPayload = {
    name,
    code: payload.code ?? null,
    country: payload.country ?? null,
    founded: coerceNumberOrNull(payload.founded),
    national: payload.national ?? false,
    logo: payload.logo ?? null,
    venue_id: coerceNumberOrNull(payload.venue_id),
  };

  return createTeamRecord(sanitizedPayload);
}

/**
 * Cập nhật thông tin team
 * 
 * @async
 * @function updateTeam
 * @description Cập nhật một hoặc nhiều field của team.
 * Chỉ cập nhật các field được truyền trong body.
 * 
 * @param {number|string} teamIdRaw - ID của team cần cập nhật
 * @param {Object} body - Các field cần cập nhật
 * @param {string} [body.name] - Tên mới
 * @param {string|null} [body.code] - Mã viết tắt mới
 * @param {string|null} [body.country] - Quốc gia mới
 * @param {number|null} [body.founded] - Năm thành lập mới
 * @param {boolean} [body.national] - Có phải đội tuyển quốc gia
 * @param {string|null} [body.logo] - URL logo mới
 * @param {number|null} [body.venue_id] - ID venue mới
 * 
 * @returns {Promise<Team>} Team object sau khi cập nhật
 * 
 * @throws {Error} INVALID_TEAM_ID - Nếu ID không hợp lệ
 * @throws {Error} TEAM_NOT_FOUND (404) - Nếu không tìm thấy team
 * 
 * @example
 * const team = await updateTeam(33, { name: 'Man United', logo: 'new-logo.png' });
 */
export async function updateTeam(teamIdRaw, body) {
  const teamId = parseRequiredPositiveInt(teamIdRaw, 'INVALID_TEAM_ID');

  // Build update payload chỉ với các field được truyền vào
  const updatePayload = {};
  const fields = ['name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id'];
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      // Convert số cho founded và venue_id
      if (field === 'founded' || field === 'venue_id') {
        updatePayload[field] = coerceNumberOrNull(body[field]);
      } else {
        updatePayload[field] = body[field];
      }
    }
  }

  // Thực hiện update
  const [updatedRows] = await updateTeamRecord(teamId, updatePayload);
  if (updatedRows === 0) {
    throw createError('TEAM_NOT_FOUND', 404);
  }
  
  // Return team đã cập nhật
  return findTeamById(teamId);
}

/**
 * Xóa team
 * 
 * @async
 * @function deleteTeam
 * @description Xóa một team khỏi database (hard delete).
 * 
 * @param {number|string} teamIdRaw - ID của team cần xóa
 * 
 * @returns {Promise<boolean>} True nếu xóa thành công
 * 
 * @throws {Error} INVALID_TEAM_ID - Nếu ID không hợp lệ
 * @throws {Error} TEAM_NOT_FOUND (404) - Nếu không tìm thấy team
 * 
 * @example
 * await deleteTeam(33);
 */
export async function deleteTeam(teamIdRaw) {
  const teamId = parseRequiredPositiveInt(teamIdRaw, 'INVALID_TEAM_ID');
  const deletedRows = await deleteTeamRecord(teamId);
  if (deletedRows === 0) {
    throw createError('TEAM_NOT_FOUND', 404);
  }
  return true;
}

/**
 * Tìm kiếm teams theo tên
 * 
 * @async
 * @function searchTeams
 * @description Tìm kiếm teams với keyword trong tên (partial match).
 * Giới hạn kết quả từ 1-100 items.
 * 
 * @param {Object} [params={}] - Search parameters
 * @param {string} params.name - Từ khóa tìm kiếm (bắt buộc)
 * @param {number|string} [params.limit=20] - Số kết quả tối đa (1-100)
 * 
 * @returns {Promise<Object>} Search result object
 * @returns {Team[]} returns.results - Mảng các team phù hợp
 * @returns {number} returns.total - Số kết quả trả về
 * @returns {number} returns.limit - Limit đã áp dụng
 * @returns {string} returns.keyword - Từ khóa đã tìm
 * 
 * @throws {Error} INVALID_TEAM_NAME - Nếu keyword trống
 * @throws {Error} INVALID_SEARCH_LIMIT - Nếu limit không trong khoảng 1-100
 * 
 * @example
 * const result = await searchTeams({ name: 'United', limit: 10 });
 * // { results: [...], total: 5, limit: 10, keyword: 'United' }
 */
export async function searchTeams(params = {}) {
  // Validate và sanitize keyword
  const rawName = params.name;
  const keyword = typeof rawName === 'string' ? rawName.trim() : '';
  if (!keyword) {
    throw createError('INVALID_TEAM_NAME');
  }

  // Parse và validate limit
  let limit = DEFAULT_LIMIT;
  if (params.limit !== undefined) {
    const parsedLimit = parsePositiveIntOrDefault(params.limit, DEFAULT_LIMIT);
    if (parsedLimit === null || parsedLimit > MAX_SEARCH_LIMIT) {
      throw createError('INVALID_SEARCH_LIMIT');
    }
    limit = parsedLimit;
  }

  // Escape keyword để tránh SQL injection trong LIKE
  const escapedKeyword = escapeForLike(keyword);
  const teams = await searchTeamsByName(escapedKeyword, limit);
  
  return {
    results: teams,
    total: teams.length,
    limit,
    keyword,
  };
}

/**
 * Lấy danh sách teams phổ biến
 * 
 * @async
 * @function listPopularTeams
 * @description Trả về danh sách các đội bóng được đánh dấu là phổ biến (isPopular=true).
 * Có hỗ trợ phân trang.
 * 
 * @param {Object} [params={}] - Query parameters
 * @param {number|string} [params.page=1] - Số trang
 * @param {number|string} [params.limit=20] - Số items mỗi trang
 * 
 * @returns {Promise<Object>} Response với data và pagination
 * @returns {Team[]} returns.data - Mảng các popular teams
 * @returns {Object} returns.pagination - Thông tin phân trang
 * 
 * @throws {Error} INVALID_PAGE - Nếu page không hợp lệ
 * @throws {Error} INVALID_LIMIT - Nếu limit không hợp lệ
 * 
 * @example
 * const result = await listPopularTeams({ page: 1, limit: 10 });
 */
export async function listPopularTeams(params = {}) {
  const pageNumber = parsePositiveIntOrDefault(params.page, DEFAULT_PAGE);
  if (pageNumber === null) {
    throw createError('INVALID_PAGE');
  }

  const limitNumber = parsePositiveIntOrDefault(params.limit, DEFAULT_LIMIT);
  if (limitNumber === null) {
    throw createError('INVALID_LIMIT');
  }

  // Query với filter popularOnly = true
  const { rows, count } = await paginateTeams({ page: pageNumber, limit: limitNumber, popularOnly: true });
  return {
    data: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limitNumber),
      page: pageNumber,
      limit: limitNumber,
    },
  };
}

/**
 * Import teams từ API-Football
 * 
 * @async
 * @function importTeams
 * @description Import teams từ API-Football cho một league và season cụ thể.
 * Hỗ trợ chạy background (qua queue) hoặc synchronous.
 * 
 * @param {Object} [params={}] - Import parameters
 * @param {number|string} params.season - Season year (bắt buộc)
 * @param {number|string} params.league - League ID (bắt buộc)
 * @param {boolean|string} [params.background=false] - Chạy trong background queue
 * 
 * @returns {Promise<Object>} Import result
 * @returns {boolean} [returns.queued] - True nếu đã đưa vào queue
 * @returns {number} [returns.imported] - Số teams đã import (nếu sync)
 * @returns {number} [returns.mappingsInserted] - Số mappings đã tạo
 * @returns {Array} [returns.mappingErrors] - Lỗi khi tạo mappings
 * @returns {number} returns.season - Season đã import
 * @returns {number} returns.league - League ID đã import
 * 
 * @throws {Error} MISSING_SEASON - Nếu thiếu season
 * @throws {Error} MISSING_LEAGUE - Nếu thiếu league
 * 
 * @example
 * // Sync import
 * const result = await importTeams({ season: 2023, league: 39 });
 * 
 * @example
 * // Background import
 * const result = await importTeams({ season: 2023, league: 39, background: true });
 * // { queued: true, message: '...', season: 2023, league: 39 }
 */
export async function importTeams(params = {}) {
  const seasonValue = parseRequiredPositiveInt(params.season, 'MISSING_SEASON');
  const leagueValue = parseRequiredPositiveInt(params.league, 'MISSING_LEAGUE');
  const background = isBackgroundFlagTrue(params.background);

  // Nếu background flag được set, đưa job vào queue và return ngay
  if (background) {
    await enqueueTeamImportJob({ leagueId: leagueValue, season: seasonValue });
    return {
      queued: true,
      message: 'Tác vụ import đã được đưa vào hàng đợi',
      season: seasonValue,
      league: leagueValue,
    };
  }

  // Thực hiện import synchronously
  return performTeamImport({ leagueId: leagueValue, season: seasonValue });
}

/**
 * Thực hiện import teams từ API-Football
 * 
 * @async
 * @function performTeamImport
 * @description Hàm thực thi việc import teams - được gọi trực tiếp hoặc từ queue worker.
 * 
 * Flow:
 * 1. Gọi API-Football để lấy danh sách teams
 * 2. Transform và validate dữ liệu
 * 3. Bulk upsert teams vào database
 * 4. Tạo/update mapping league-team-season
 * 
 * @param {Object} params - Import parameters
 * @param {number|string} params.leagueId - League ID
 * @param {number|string} params.season - Season year
 * 
 * @returns {Promise<Object>} Import result details
 * @returns {number} returns.imported - Số teams đã import
 * @returns {number} returns.mappingsInserted - Số mappings đã tạo thành công
 * @returns {Array<{teamId: number, reason: string}>} returns.mappingErrors - Lỗi khi tạo mappings
 * @returns {number} returns.season - Season đã import
 * @returns {number} returns.league - League ID
 * @returns {number|null} returns.totalPages - Tổng số pages từ API
 * @returns {string} [returns.message] - Thông báo bổ sung nếu không có data
 * 
 * @throws {Error} INVALID_LEAGUE_ID - Nếu leagueId không hợp lệ
 * @throws {Error} INVALID_SEASON - Nếu season không hợp lệ
 */
export async function performTeamImport({ leagueId, season }) {
  const leagueValue = parseRequiredPositiveInt(leagueId, 'INVALID_LEAGUE_ID');
  const seasonValue = parseRequiredPositiveInt(season, 'INVALID_SEASON');

  // Chuẩn bị params cho API call
  const apiParams = {
    league: leagueValue,
    season: seasonValue,
  };

  // Gọi API-Football endpoint /teams
  const data = await apiFootballGet('/teams', apiParams);
  const totalPages = data?.paging?.total ?? null;
  const apiTeams = Array.isArray(data?.response) ? data.response : [];

  // Handle trường hợp API trả về rỗng
  if (apiTeams.length === 0) {
    return {
      imported: 0,
      mappingsInserted: 0,
      mappingErrors: [],
      season: seasonValue,
      league: leagueValue,
      totalPages,
      message: 'Không có đội bóng nào được trả về từ API-Football',
    };
  }

  // Transform API response thành team payloads, lọc bỏ invalid entries
  const teamPayloads = apiTeams.map((entry) => buildTeamPayloadFromApi(entry)).filter((payload) => payload !== null);

  if (teamPayloads.length === 0) {
    return {
      imported: 0,
      mappingsInserted: 0,
      mappingErrors: [],
      season: seasonValue,
      league: leagueValue,
      totalPages,
      message: 'Không có đội bóng hợp lệ để lưu',
    };
  }

  // Bulk upsert teams vào database
  await bulkUpsertTeams(teamPayloads);

  // Tạo mappings league-team-season cho mỗi team
  const uniqueTeamIds = [...new Set(teamPayloads.map((payload) => payload.id))];
  let mappingsInserted = 0;
  const mappingErrors = [];
  
  // Xử lý từng team để tạo mapping
  for (const teamId of uniqueTeamIds) {
    try {
      await upsertLeagueTeamSeason({ leagueId: leagueValue, teamId, season: seasonValue });
      mappingsInserted += 1;
    } catch (error) {
      // Log lỗi nhưng không throw để continue với các teams khác
      mappingErrors.push({
        teamId,
        reason: error?.message || 'Không xác định',
      });
    }
  }

  return {
    imported: teamPayloads.length,
    mappingsInserted,
    mappingErrors,
    season: seasonValue,
    league: leagueValue,
    totalPages,
  };
}

/**
 * Lấy thống kê đội bóng từ API-Football
 * 
 * @async
 * @function getTeamStats
 * @description Lấy thống kê chi tiết của một đội bóng trong một league và season cụ thể.
 * Dữ liệu được lấy real-time từ API-Football.
 * 
 * @param {Object} [params={}] - Query parameters
 * @param {number|string} params.teamId - Team ID (bắt buộc)
 * @param {number|string} params.leagueId - League ID (bắt buộc)
 * @param {number|string} params.season - Season year (bắt buộc)
 * 
 * @returns {Promise<Object>} Statistics response
 * @returns {number} returns.league - League ID
 * @returns {number} returns.leagueId - League ID (alias)
 * @returns {number} returns.season - Season year
 * @returns {number} returns.teamId - Team ID
 * @returns {string} returns.source - Nguồn dữ liệu ('API-Football')
 * @returns {Object} returns.payload - Raw statistics data từ API
 * 
 * @throws {Error} INVALID_TEAM_ID - Nếu teamId không hợp lệ
 * @throws {Error} INVALID_LEAGUE_ID - Nếu leagueId không hợp lệ
 * @throws {Error} INVALID_SEASON - Nếu season không hợp lệ
 * @throws {Error} API_FOOTBALL_ERROR - Nếu API call thất bại
 * @throws {Error} API_FOOTBALL_TIMEOUT (504) - Nếu API timeout
 * 
 * @example
 * const stats = await getTeamStats({ teamId: 33, leagueId: 39, season: 2023 });
 */
export async function getTeamStats(params = {}) {
  const teamId = parseRequiredPositiveInt(params.teamId, 'INVALID_TEAM_ID');
  const leagueId = parseRequiredPositiveInt(params.leagueId, 'INVALID_LEAGUE_ID');
  const season = parseRequiredPositiveInt(params.season, 'INVALID_SEASON');

  try {
    // Gọi API-Football endpoint /teams/statistics
    const data = await apiFootballGet('/teams/statistics', {
      league: leagueId,
      team: teamId,
      season,
    });
    
    return {
      league: leagueId,
      leagueId,
      season,
      teamId,
      source: 'API-Football',
      payload: data,
    };
  } catch (error) {
    // Handle API errors với error codes phù hợp
    if (error?.response) {
      throw createError('API_FOOTBALL_ERROR', error.response.status || 500, error.response.data);
    }
    // Handle timeout error
    if (error?.code === 'ECONNABORTED') {
      throw createError('API_FOOTBALL_TIMEOUT', 504);
    }
    throw error;
  }
}
