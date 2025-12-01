/**
 * =============================================================================
 * FILE: src/modules/players/services/players.service.js
 * =============================================================================
 * 
 * @fileoverview Players Business Logic Service
 * 
 * @description
 * Service layer xử lý business logic cho Players.
 * Bao gồm CRUD, search, pagination, API-Football integration và statistics.
 * 
 * ## Features:
 * - Player CRUD operations với validation
 * - Paginated listing với filters
 * - Search by name (case-insensitive)
 * - Popular players filtering
 * - Import từ API-Football
 * - Player statistics từ API
 * 
 * ## Dependencies:
 * - apiFootball service: External API client
 * - playerTeamLeagueSeason service: Relationship management
 * 
 * ## Error Handling:
 * - PlayersServiceError với custom status codes
 * - Pagination validation
 * - Field validation cho create/update
 * 
 * @module modules/players/services/players.service
 * @requires sequelize
 * @requires modules/countries/models/country.model
 * @requires modules/players/repositories/players.repository
 * 
 * =============================================================================
 */

import sequelize from '../../../common/db.js';
import Country from '../../countries/models/country.model.js';
import {
  bulkUpsertPlayers,
  countPlayers,
  deletePlayer,
  findAndCountPlayers,
  findPlayerById,
  findPlayers,
  updatePlayer,
  createPlayer,
  buildNameSearchCondition,
} from '../repositories/players.repository.js';

// =============================================================================
// Constants
// =============================================================================

/**
 * Attributes để select từ Player model.
 * @constant {string[]}
 */
const PLAYER_ATTRIBUTES = [
  'id',
  'name',
  'firstname',
  'lastname',
  'age',
  'birth_date',
  'birth_place',
  'birth_country',
  'nationality',
  'height',
  'weight',
  'number',
  'position',
  'photo',
  'isPopular',
];

const COUNTRY_ATTRIBUTES = ['id', 'name', 'code', 'flag'];
const MAX_PLAYER_LIMIT = 100;
const paginationErrorMessages = {
  INVALID_PAGE: 'Giá trị page phải là số nguyên dương',
  INVALID_LIMIT: 'Giá trị limit phải là số nguyên dương',
  LIMIT_TOO_LARGE: `Giá trị limit không được vượt quá ${MAX_PLAYER_LIMIT}`,
};
const allowedFields = [
  'name',
  'firstname',
  'lastname',
  'age',
  'birth_date',
  'birth_place',
  'birth_country',
  'nationality',
  'height',
  'weight',
  'number',
  'position',
  'photo',
];

let apiFootballService;
let playerTeamLeagueSeasonService;
let playerTeamLeagueSeasonResolver;

export class PlayersServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function initPlayersService({ apiFootball, playerTeamLeagueSeason, resolvePlayerTeamLeagueSeason }) {
  apiFootballService = apiFootball;
  playerTeamLeagueSeasonService = playerTeamLeagueSeason;
  playerTeamLeagueSeasonResolver = resolvePlayerTeamLeagueSeason;
}

function ensureApiFootball() {
  if (!apiFootballService || typeof apiFootballService.apiFootballGet !== 'function') {
    throw new PlayersServiceError('API Football service is not configured', 500);
  }
  return apiFootballService;
}

function ensurePlayerTeamLeagueSeasonService() {
  if (!playerTeamLeagueSeasonService && typeof playerTeamLeagueSeasonResolver === 'function') {
    playerTeamLeagueSeasonService = playerTeamLeagueSeasonResolver() || playerTeamLeagueSeasonService;
  }
  if (!playerTeamLeagueSeasonService || typeof playerTeamLeagueSeasonService.createMappingRecord !== 'function') {
    throw new PlayersServiceError('Player-team-league-season service is not configured', 500);
  }
  return playerTeamLeagueSeasonService;
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

function validateId(rawId) {
  const parsed = Number.parseInt(rawId, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parsePaginationParams(query, { defaultLimit = 20, maxLimit = MAX_PLAYER_LIMIT } = {}) {
  const pageNumber = parsePositiveIntOrDefault(query.page, 1);
  if (pageNumber === null) {
    throw new PlayersServiceError(paginationErrorMessages.INVALID_PAGE, 400);
  }

  const limitNumber = parsePositiveIntOrDefault(query.limit, defaultLimit);
  if (limitNumber === null) {
    throw new PlayersServiceError(paginationErrorMessages.INVALID_LIMIT, 400);
  }

  if (limitNumber > maxLimit) {
    throw new PlayersServiceError(paginationErrorMessages.LIMIT_TOO_LARGE, 400);
  }

  return {
    pageNumber,
    limitNumber,
    offset: (pageNumber - 1) * limitNumber,
  };
}

function normalizeStringField(value) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

function parseOptionalIntegerField(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === '') {
    return null;
  }
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed)) {
    throw new PlayersServiceError(`Field ${fieldName} must be a valid positive integer`, 400);
  }
  if ((fieldName === 'age' || fieldName === 'number') && parsed <= 0) {
    throw new PlayersServiceError(`Field ${fieldName} must be a valid positive integer`, 400);
  }
  return parsed;
}

function buildPayload(body = {}) {
  const payload = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      if (field === 'age' || field === 'number') {
        const parsed = parseOptionalIntegerField(body[field], field);
        if (parsed !== undefined) {
          payload[field] = parsed;
        }
      } else {
        const normalized = normalizeStringField(body[field]);
        if (normalized !== undefined) {
          payload[field] = normalized;
        }
      }
    }
  }
  return payload;
}

async function fetchCountryByName(countryName) {
  if (!countryName) {
    return null;
  }
  const normalized = countryName.trim();
  if (!normalized) {
    return null;
  }
  return Country.findOne({
    attributes: COUNTRY_ATTRIBUTES,
    where: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), normalized.toLowerCase()),
  });
}

export async function listPlayers(query) {
  const { pageNumber, limitNumber, offset } = parsePaginationParams(query);
  
  // Build where clause for optional nationality filter
  const whereClause = {};
  if (query.nationality && typeof query.nationality === 'string') {
    const nationality = query.nationality.trim();
    if (nationality) {
      whereClause.nationality = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nationality')),
        nationality.toLowerCase()
      );
    }
  }

  const { rows, count } = await findAndCountPlayers({
    attributes: PLAYER_ATTRIBUTES,
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    order: [['name', 'ASC']],
    limit: limitNumber,
    offset,
  });

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

export async function getPlayerDetails(rawId) {
  const playerId = validateId(rawId);
  if (!playerId) {
    throw new PlayersServiceError('Invalid player ID', 400);
  }
  const player = await findPlayerById(playerId, { attributes: PLAYER_ATTRIBUTES });
  if (!player) {
    throw new PlayersServiceError('Player not found', 404);
  }
  const country = await fetchCountryByName(player.nationality ?? '');
  return {
    ...player.toJSON(),
    country: country ? country.toJSON() : null,
  };
}

export async function searchPlayers(query) {
  const keywordRaw = typeof query.name === 'string' ? query.name.trim() : '';
  if (!keywordRaw) {
    throw new PlayersServiceError('name parameter is required', 400);
  }
  const limitValue = parsePositiveIntOrDefault(query.limit, 20);
  if (limitValue === null || limitValue > 100) {
    throw new PlayersServiceError('Limit value must be between 1 and 100', 400);
  }
  const keywordLower = keywordRaw.toLowerCase();
  const { where } = buildNameSearchCondition(keywordLower);
  const players = await findPlayers({
    attributes: PLAYER_ATTRIBUTES,
    where,
    order: [['name', 'ASC']],
    limit: limitValue,
  });
  return {
    results: players,
    total: players.length,
    limit: limitValue,
    keyword: keywordRaw,
  };
}

export async function createPlayerRecord(body = {}) {
  const playerId = validateId(body.id);
  if (!playerId) {
    throw new PlayersServiceError('Player ID is required and must be a positive integer', 400);
  }
  const existing = await findPlayerById(playerId);
  if (existing) {
    throw new PlayersServiceError('Player already exists', 409);
  }
  const payload = { id: playerId, ...buildPayload(body) };
  if (!payload.name) {
    throw new PlayersServiceError('Field name is required', 400);
  }
  await createPlayer(payload);
  return findPlayerById(playerId, { attributes: PLAYER_ATTRIBUTES });
}

export async function updatePlayerRecord(rawId, body = {}) {
  const playerId = validateId(rawId);
  if (!playerId) {
    throw new PlayersServiceError('Invalid player ID', 400);
  }
  const updatePayload = buildPayload(body);
  if (!Object.keys(updatePayload).length) {
    throw new PlayersServiceError('No data to update', 400);
  }
  const [updatedRows] = await updatePlayer(playerId, updatePayload);
  if (!updatedRows) {
    throw new PlayersServiceError('Player not found for update', 404);
  }
  return findPlayerById(playerId, { attributes: PLAYER_ATTRIBUTES });
}

export async function removePlayerRecord(rawId) {
  const playerId = validateId(rawId);
  if (!playerId) {
    throw new PlayersServiceError('Invalid player ID', 400);
  }
  const deletedRows = await deletePlayer(playerId);
  if (!deletedRows) {
    throw new PlayersServiceError('Player not found for deletion', 404);
  }
  return true;
}

export async function listPopularPlayers(query) {
  const { pageNumber, limitNumber, offset } = parsePaginationParams(query);
  const { rows, count } = await findAndCountPlayers({
    attributes: PLAYER_ATTRIBUTES,
    where: { isPopular: true },
    order: [['name', 'ASC']],
    limit: limitNumber,
    offset,
  });
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

function parseApiInteger(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function buildImportPayload(apiItem, leagueValue, teamValue, seasonValue) {
  const player = apiItem?.player;
  if (!player || !Number.isInteger(player.id)) {
    return null;
  }
  const stats = Array.isArray(apiItem?.statistics) && apiItem.statistics.length > 0 ? apiItem.statistics[0] : null;
  const inferredTeamIdFromStats = parseApiInteger(stats?.team?.id);
  const resolvedTeamId = teamValue !== undefined ? teamValue : inferredTeamIdFromStats;

  const playerPayload = {
    id: player.id,
    name: normalizeStringField(player.name) ?? null,
    firstname: normalizeStringField(player.firstname) ?? null,
    lastname: normalizeStringField(player.lastname) ?? null,
    age: parseApiInteger(player.age),
    birth_date: player.birth?.date || null,
    birth_place: normalizeStringField(player.birth?.place) ?? null,
    birth_country: normalizeStringField(player.birth?.country) ?? null,
    nationality: normalizeStringField(player.nationality) ?? null,
    height: normalizeStringField(player.height) ?? null,
    weight: normalizeStringField(player.weight) ?? null,
    number: parseApiInteger(player.number ?? stats?.games?.number),
    position: normalizeStringField(player.position ?? stats?.games?.position) ?? null,
    photo: normalizeStringField(player.photo) ?? null,
  };

  const mappingPayload = resolvedTeamId
    ? {
      playerId: player.id,
      leagueId: leagueValue,
      teamId: resolvedTeamId,
      season: seasonValue,
    }
    : null;

  return {
    playerPayload,
    mappingPayload,
  };
}

export async function importPlayersFromApi(query = {}) {
  const seasonValue = parsePositiveIntOrDefault(query.season, undefined);
  if (seasonValue === undefined) {
    throw new PlayersServiceError('season is required', 400);
  }
  if (seasonValue === null) {
    throw new PlayersServiceError('season must be a positive integer', 400);
  }

  const leagueValue = parsePositiveIntOrDefault(query.league, undefined);
  if (leagueValue === undefined) {
    throw new PlayersServiceError('league is required', 400);
  }
  if (leagueValue === null) {
    throw new PlayersServiceError('league must be a positive integer', 400);
  }

  const teamValue = parsePositiveIntOrDefault(query.team, undefined);
  if (teamValue === undefined) {
    throw new PlayersServiceError('team is required', 400);
  }
  if (teamValue === null) {
    throw new PlayersServiceError('team must be a positive integer', 400);
  }

  const pageNumber = parsePositiveIntOrDefault(query.page, 1);
  if (pageNumber === null) {
    throw new PlayersServiceError('page must be a positive integer', 400);
  }

  const apiParams = { season: seasonValue, league: leagueValue, page: pageNumber, team: teamValue };
  const { apiFootballGet } = ensureApiFootball();
  const apiData = await apiFootballGet('/players', apiParams);
  const apiPlayers = Array.isArray(apiData?.response) ? apiData.response : [];

  if (!apiPlayers.length) {
    return { imported: 0, message: 'No players found' };
  }

  const playerEntries = apiPlayers
    .map((item) => buildImportPayload(item, leagueValue, teamValue, seasonValue))
    .filter((entry) => entry && entry.playerPayload.name);

  if (!playerEntries.length) {
    return { imported: 0, message: 'Không có cầu thủ hợp lệ để lưu' };
  }

  const playerPayloads = playerEntries.map((entry) => entry.playerPayload);
  const mappingPayloads = playerEntries.map((entry) => entry.mappingPayload).filter(Boolean);

  await bulkUpsertPlayers(playerPayloads);

  const mappingService = ensurePlayerTeamLeagueSeasonService();
  let createdMappings = 0;
  const mappingErrors = [];
  for (const mappingPayload of mappingPayloads) {
    try {
      await mappingService.createMappingRecord(mappingPayload);
      createdMappings += 1;
    } catch (error) {
      mappingErrors.push({
        playerId: mappingPayload.playerId,
        reason: error?.message || 'Unknown',
      });
    }
  }

  return {
    imported: playerPayloads.length,
    mappingsInserted: createdMappings,
    mappingErrors,
    page: pageNumber,
    totalPages: apiData?.paging?.total ?? null,
    season: seasonValue,
    league: leagueValue,
    team: teamValue ?? null,
  };
}

export async function getPlayerStats(query = {}) {
  const playerId = parsePositiveIntOrDefault(query.playerid, undefined);
  if (playerId === undefined) {
    throw new PlayersServiceError('playerid is required', 400);
  }
  if (playerId === null) {
    throw new PlayersServiceError('playerid must be a positive integer', 400);
  }
  const params = { id: playerId };

  const seasonValue = parsePositiveIntOrDefault(query.season, undefined);
  if (seasonValue !== undefined) {
    if (seasonValue === null) {
      throw new PlayersServiceError('season must be a positive integer', 400);
    }
    params.season = seasonValue;
  }

  const leagueId = parsePositiveIntOrDefault(query.leagueid, undefined);
  if (leagueId !== undefined) {
    if (leagueId === null) {
      throw new PlayersServiceError('leagueid must be a positive integer', 400);
    }
    params.league = leagueId;
  }

  const teamId = parsePositiveIntOrDefault(query.teamid, undefined);
  if (teamId !== undefined) {
    if (teamId === null) {
      throw new PlayersServiceError('teamid must be a positive integer', 400);
    }
    params.team = teamId;
  }

  const { apiFootballGet } = ensureApiFootball();
  const data = await apiFootballGet('/players', params);
  return data;
}

/**
 * Get the total count of players in the database.
 * 
 * @async
 * @function getPlayersCount
 * @returns {Promise<Object>} Object containing total count
 * @returns {number} returns.total - Total number of players
 * 
 * @example
 * const result = await getPlayersCount();
 * console.log(result.total); // 8500
 */
export async function getPlayersCount() {
  const total = await countPlayers();
  return { total };
}
