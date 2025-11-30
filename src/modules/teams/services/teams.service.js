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

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_SEARCH_LIMIT = 100;

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

function createError(code, status = 400, details) {
  const error = new Error(ERROR_MESSAGES[code] || code);
  error.code = code;
  error.status = status;
  if (details) {
    error.details = details;
  }
  return error;
}

function parsePositiveIntOrDefault(value, defaultValue) {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return defaultValue;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

function parseRequiredPositiveInt(value, code) {
  const parsed = parsePositiveIntOrDefault(value, null);
  if (parsed === null) {
    throw createError(code);
  }
  return parsed;
}

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

function normalizeStringField(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

function coerceNumberOrNull(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

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

function buildTeamPayloadFromApi(entry) {
  const team = entry?.team;
  if (!team) {
    return null;
  }
  const teamId = parseApiInteger(team.id);
  if (!teamId) {
    return null;
  }
  const payload = {
    id: teamId,
    name: normalizeStringField(team.name),
    code: normalizeStringField(team.code),
    country: normalizeStringField(team.country),
    founded: parseApiInteger(team.founded),
    national: Boolean(team.national),
    logo: normalizeStringField(team.logo),
    venue_id: parseApiInteger(entry?.venue?.id),
  };
  if (!payload.name) {
    return null;
  }
  return payload;
}

function escapeForLike(value) {
  return value.replace(/[%_]/g, '\\$&');
}

function isBackgroundFlagTrue(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

export async function listTeams(params = {}) {
  const pageNumber = parsePositiveIntOrDefault(params.page, DEFAULT_PAGE);
  if (pageNumber === null) {
    throw createError('INVALID_PAGE');
  }

  const limitNumber = parsePositiveIntOrDefault(params.limit, DEFAULT_LIMIT);
  if (limitNumber === null) {
    throw createError('INVALID_LIMIT');
  }

  const { rows, count } = await paginateTeams({ page: pageNumber, limit: limitNumber });
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

export async function getTeam(teamIdRaw) {
  const teamId = parseRequiredPositiveInt(teamIdRaw, 'INVALID_TEAM_ID');
  const team = await findTeamById(teamId);
  if (!team) {
    throw createError('TEAM_NOT_FOUND', 404);
  }
  return team;
}

export async function getTeamsByLeague(params) {
  const leagueId = parseRequiredPositiveInt(params.leagueId, 'INVALID_LEAGUE_ID');
  let parsedSeason;
  if (params.season !== undefined) {
    parsedSeason = parseOptionalPositiveInt(params.season);
  }

  const mappings = await findMappingsByLeagueAndSeason(leagueId, parsedSeason);
  if (mappings.length === 0) {
    throw createError('NO_LEAGUE_MAPPINGS', 404);
  }

  const teamIds = [...new Set(mappings.map((entry) => entry.teamId))];
  const teams = await findTeamsByIds(teamIds);
  if (teams.length === 0) {
    throw createError('NO_TEAMS_FOR_LEAGUE', 404);
  }
  return teams;
}

export async function createTeam(payload) {
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (!name) {
    throw createError('INVALID_TEAM_NAME');
  }

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

export async function updateTeam(teamIdRaw, body) {
  const teamId = parseRequiredPositiveInt(teamIdRaw, 'INVALID_TEAM_ID');

  const updatePayload = {};
  const fields = ['name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id'];
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      if (field === 'founded' || field === 'venue_id') {
        updatePayload[field] = coerceNumberOrNull(body[field]);
      } else {
        updatePayload[field] = body[field];
      }
    }
  }

  const [updatedRows] = await updateTeamRecord(teamId, updatePayload);
  if (updatedRows === 0) {
    throw createError('TEAM_NOT_FOUND', 404);
  }
  return findTeamById(teamId);
}

export async function deleteTeam(teamIdRaw) {
  const teamId = parseRequiredPositiveInt(teamIdRaw, 'INVALID_TEAM_ID');
  const deletedRows = await deleteTeamRecord(teamId);
  if (deletedRows === 0) {
    throw createError('TEAM_NOT_FOUND', 404);
  }
  return true;
}

export async function searchTeams(params = {}) {
  const rawName = params.name;
  const keyword = typeof rawName === 'string' ? rawName.trim() : '';
  if (!keyword) {
    throw createError('INVALID_TEAM_NAME');
  }

  let limit = DEFAULT_LIMIT;
  if (params.limit !== undefined) {
    const parsedLimit = parsePositiveIntOrDefault(params.limit, DEFAULT_LIMIT);
    if (parsedLimit === null || parsedLimit > MAX_SEARCH_LIMIT) {
      throw createError('INVALID_SEARCH_LIMIT');
    }
    limit = parsedLimit;
  }

  const escapedKeyword = escapeForLike(keyword);
  const teams = await searchTeamsByName(escapedKeyword, limit);
  return {
    results: teams,
    total: teams.length,
    limit,
    keyword,
  };
}

export async function listPopularTeams(params = {}) {
  const pageNumber = parsePositiveIntOrDefault(params.page, DEFAULT_PAGE);
  if (pageNumber === null) {
    throw createError('INVALID_PAGE');
  }

  const limitNumber = parsePositiveIntOrDefault(params.limit, DEFAULT_LIMIT);
  if (limitNumber === null) {
    throw createError('INVALID_LIMIT');
  }

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

export async function importTeams(params = {}) {
  const seasonValue = parseRequiredPositiveInt(params.season, 'MISSING_SEASON');
  const leagueValue = parseRequiredPositiveInt(params.league, 'MISSING_LEAGUE');
  const background = isBackgroundFlagTrue(params.background);

  if (background) {
    await enqueueTeamImportJob({ leagueId: leagueValue, season: seasonValue });
    return {
      queued: true,
      message: 'Tác vụ import đã được đưa vào hàng đợi',
      season: seasonValue,
      league: leagueValue,
    };
  }

  return performTeamImport({ leagueId: leagueValue, season: seasonValue });
}

export async function performTeamImport({ leagueId, season }) {
  const leagueValue = parseRequiredPositiveInt(leagueId, 'INVALID_LEAGUE_ID');
  const seasonValue = parseRequiredPositiveInt(season, 'INVALID_SEASON');

  const apiParams = {
    league: leagueValue,
    season: seasonValue,
  };

  const data = await apiFootballGet('/teams', apiParams);
  const totalPages = data?.paging?.total ?? null;
  const apiTeams = Array.isArray(data?.response) ? data.response : [];

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

  await bulkUpsertTeams(teamPayloads);

  const uniqueTeamIds = [...new Set(teamPayloads.map((payload) => payload.id))];
  let mappingsInserted = 0;
  const mappingErrors = [];
  for (const teamId of uniqueTeamIds) {
    try {
      await upsertLeagueTeamSeason({ leagueId: leagueValue, teamId, season: seasonValue });
      mappingsInserted += 1;
    } catch (error) {
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

export async function getTeamStats(params = {}) {
  const teamId = parseRequiredPositiveInt(params.teamId, 'INVALID_TEAM_ID');
  const leagueId = parseRequiredPositiveInt(params.leagueId, 'INVALID_LEAGUE_ID');
  const season = parseRequiredPositiveInt(params.season, 'INVALID_SEASON');

  try {
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
    if (error?.response) {
      throw createError('API_FOOTBALL_ERROR', error.response.status || 500, error.response.data);
    }
    if (error?.code === 'ECONNABORTED') {
      throw createError('API_FOOTBALL_TIMEOUT', 504);
    }
    throw error;
  }
}
