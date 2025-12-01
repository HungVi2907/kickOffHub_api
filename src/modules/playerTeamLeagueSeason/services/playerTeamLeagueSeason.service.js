/**
 * @file Player-Team-League-Season Service
 * @description Business logic for managing player-team-league-season relationships.
 *              Provides functions for CRUD operations on player-team-league-season mappings.
 * @module modules/playerTeamLeagueSeason/services/playerTeamLeagueSeason
 */

import {
  deleteMappingByIdentifiers,
  findMappingByIdentifiers,
  findMappingsWithPlayers,
  upsertMapping,
} from '../repositories/playerTeamLeagueSeason.repository.js';

/**
 * Attributes to select when querying player data.
 *
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
];

/**
 * Custom error class for service-level errors in Player-Team-League-Season operations.
 *
 * @class PlayerTeamLeagueSeasonServiceError
 * @extends Error
 */
export class PlayerTeamLeagueSeasonServiceError extends Error {
  /**
   * Creates a new PlayerTeamLeagueSeasonServiceError.
   *
   * @param {string} message - Error message
   * @param {number} [statusCode=400] - HTTP status code
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Parses and validates a positive integer value.
 *
 * @function parsePositiveInt
 * @param {*} value - Value to parse
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} [options={}] - Parsing options
 * @param {boolean} [options.required=false] - Whether the field is required
 * @returns {number|undefined} Parsed positive integer or undefined
 * @throws {PlayerTeamLeagueSeasonServiceError} If value is invalid or required but missing
 * @private
 */
function parsePositiveInt(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new PlayerTeamLeagueSeasonServiceError(`Thiếu thông tin bắt buộc: ${fieldName}`);
    }
    return undefined;
  }
  const parsed = Number.parseInt(String(value).trim(), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new PlayerTeamLeagueSeasonServiceError(`Trường ${fieldName} phải là số nguyên dương hợp lệ`);
  }
  return parsed;
}

/**
 * Builds a validated payload object from request body.
 *
 * @function buildPayload
 * @param {Object} [body={}] - Request body containing mapping fields
 * @param {Object} [options={}] - Build options
 * @param {boolean} [options.allowPartial=false] - Allow partial payloads for updates
 * @returns {Object} Validated payload object
 * @throws {PlayerTeamLeagueSeasonServiceError} If required fields are missing
 * @private
 */
function buildPayload(body = {}, { allowPartial = false } = {}) {
  const payload = {};
  for (const field of ['playerId', 'leagueId', 'teamId', 'season']) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const parsed = parsePositiveInt(body[field], field, { required: !allowPartial });
      if (parsed !== undefined) {
        payload[field] = parsed;
      }
    }
  }

  if (!allowPartial) {
    for (const field of ['playerId', 'leagueId', 'teamId', 'season']) {
      if (!Object.prototype.hasOwnProperty.call(payload, field)) {
        throw new PlayerTeamLeagueSeasonServiceError(`Thiếu thông tin bắt buộc: ${field}`);
      }
    }
  }

  return payload;
}

/**
 * Normalizes and validates composite key identifiers.
 *
 * @function normalizeIdentifiers
 * @param {Object} [raw={}] - Raw identifier values
 * @param {string|number} raw.playerId - Player ID
 * @param {string|number} raw.leagueId - League ID
 * @param {string|number} raw.teamId - Team ID
 * @param {string|number} raw.season - Season year
 * @returns {Object} Normalized identifiers object
 * @throws {PlayerTeamLeagueSeasonServiceError} If any identifier is invalid
 * @private
 */
function normalizeIdentifiers(raw = {}) {
  return {
    playerId: parsePositiveInt(raw.playerId, 'playerId', { required: true }),
    leagueId: parsePositiveInt(raw.leagueId, 'leagueId', { required: true }),
    teamId: parsePositiveInt(raw.teamId, 'teamId', { required: true }),
    season: parsePositiveInt(raw.season, 'season', { required: true }),
  };
}

/**
 * Handles Sequelize-specific errors and converts them to service errors.
 *
 * @function handleSequelizeError
 * @param {Error} error - Sequelize error object
 * @param {string} [conflictMessage] - Custom message for unique constraint violations
 * @throws {PlayerTeamLeagueSeasonServiceError} Converted service error
 * @private
 */
function handleSequelizeError(error, conflictMessage) {
  if (error?.name === 'SequelizeForeignKeyConstraintError') {
    throw new PlayerTeamLeagueSeasonServiceError(
      'playerId hoặc teamId hoặc leagueId không tồn tại trong hệ thống',
      409,
    );
  }
  if (error?.name === 'SequelizeUniqueConstraintError') {
    throw new PlayerTeamLeagueSeasonServiceError(conflictMessage ?? 'Bản ghi với thông tin mới đã tồn tại', 409);
  }
  throw error;
}

/**
 * Creates a new player-team-league-season mapping (upsert operation).
 *
 * @async
 * @function createMapping
 * @param {Object} [payload={}] - Mapping data
 * @param {number} payload.playerId - Player identifier
 * @param {number} payload.leagueId - League identifier
 * @param {number} payload.teamId - Team identifier
 * @param {number} payload.season - Season year
 * @returns {Promise<Object>} Created mapping data
 * @throws {PlayerTeamLeagueSeasonServiceError} If validation fails or foreign key doesn't exist
 */
export async function createMapping(payload = {}) {
  const data = buildPayload(payload);
  try {
    await upsertMapping(data);
  } catch (error) {
    handleSequelizeError(error);
  }
  return data;
}

/**
 * Creates a new player-team-league-season mapping record.
 * Alias for createMapping function.
 *
 * @async
 * @function createMappingRecord
 * @param {Object} [payload={}] - Mapping data
 * @returns {Promise<Object>} Created mapping data
 */
export async function createMappingRecord(payload = {}) {
  return createMapping(payload);
}

/**
 * Updates an existing player-team-league-season mapping.
 *
 * @async
 * @function updateMappingRecord
 * @param {Object} [rawIdentifiers={}] - Current composite key identifiers
 * @param {string|number} rawIdentifiers.playerId - Current player ID
 * @param {string|number} rawIdentifiers.leagueId - Current league ID
 * @param {string|number} rawIdentifiers.teamId - Current team ID
 * @param {string|number} rawIdentifiers.season - Current season year
 * @param {Object} [body={}] - Fields to update
 * @returns {Promise<Object>} Updated mapping record
 * @throws {PlayerTeamLeagueSeasonServiceError} If record not found or update fails
 */
export async function updateMappingRecord(rawIdentifiers = {}, body = {}) {
  const identifiers = normalizeIdentifiers(rawIdentifiers);
  const updates = buildPayload(body, { allowPartial: true });
  if (!Object.keys(updates).length) {
    throw new PlayerTeamLeagueSeasonServiceError('Không có dữ liệu để cập nhật');
  }

  const mapping = await findMappingByIdentifiers(identifiers);
  if (!mapping) {
    throw new PlayerTeamLeagueSeasonServiceError('Không tìm thấy bản ghi để cập nhật', 404);
  }

  try {
    await mapping.update(updates);
  } catch (error) {
    handleSequelizeError(error);
  }

  await mapping.reload();
  return mapping;
}

/**
 * Deletes a player-team-league-season mapping.
 *
 * @async
 * @function deleteMappingRecord
 * @param {Object} [rawIdentifiers={}] - Composite key identifiers
 * @param {string|number} rawIdentifiers.playerId - Player ID
 * @param {string|number} rawIdentifiers.leagueId - League ID
 * @param {string|number} rawIdentifiers.teamId - Team ID
 * @param {string|number} rawIdentifiers.season - Season year
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {PlayerTeamLeagueSeasonServiceError} If record not found (404)
 */
export async function deleteMappingRecord(rawIdentifiers = {}) {
  const identifiers = normalizeIdentifiers(rawIdentifiers);
  const deleted = await deleteMappingByIdentifiers(identifiers);
  if (!deleted) {
    throw new PlayerTeamLeagueSeasonServiceError('Không tìm thấy bản ghi để xóa', 404);
  }
  return true;
}

/**
 * Finds players by team, league, and season filters.
 *
 * @async
 * @function findPlayersByFilters
 * @param {Object} [query={}] - Filter parameters
 * @param {string|number} query.leagueId - League ID (required)
 * @param {string|number} query.teamId - Team ID (required)
 * @param {string|number} query.season - Season year (required)
 * @returns {Promise<Object>} Result object containing filters, total count, and players array
 * @returns {Object} returns.filters - Applied filter values
 * @returns {number} returns.total - Total number of players found
 * @returns {Array<Object>} returns.players - Array of player mapping objects with player details
 * @throws {PlayerTeamLeagueSeasonServiceError} If required filters are missing
 */
export async function findPlayersByFilters(query = {}) {
  const filters = {
    leagueId: parsePositiveInt(query.leagueId, 'leagueId', { required: true }),
    teamId: parsePositiveInt(query.teamId, 'teamId', { required: true }),
    season: parsePositiveInt(query.season, 'season', { required: true }),
  };

  const mappings = await findMappingsWithPlayers(filters, PLAYER_ATTRIBUTES);
  return {
    filters,
    total: mappings.length,
    players: mappings.map((record) => ({
      playerId: record.playerId,
      leagueId: record.leagueId,
      teamId: record.teamId,
      season: record.season,
      player: record.player,
    })),
  };
}
