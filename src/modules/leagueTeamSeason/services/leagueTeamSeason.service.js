/**
 * @file League-Team-Season Service
 * @description Business logic for managing league-team-season relationships.
 *              Provides functions for listing, filtering, and removing mappings.
 * @module modules/leagueTeamSeason/services/leagueTeamSeason
 */

import { Op } from 'sequelize';
import Team from '../../teams/models/team.model.js';
import {
  deleteMapping,
  findMappings,
  findTeamIdsByLeagueAndSeason,
} from '../repositories/leagueTeamSeason.repository.js';

/** @constant {string[]} TEAM_ATTRIBUTES - Attributes to select when querying teams */
const TEAM_ATTRIBUTES = ['id', 'name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id'];

/** @constant {string[]} LTS_ATTRIBUTES - Attributes to select from league-team-season records */
const LTS_ATTRIBUTES = ['leagueId', 'teamId', 'season', 'created_at', 'updated_at'];

/**
 * Custom error class for validation errors in League-Team-Season operations.
 *
 * @class LeagueTeamSeasonValidationError
 * @extends Error
 */
export class LeagueTeamSeasonValidationError extends Error {
  /**
   * Creates a new LeagueTeamSeasonValidationError.
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
 * @returns {number} Parsed positive integer
 * @throws {LeagueTeamSeasonValidationError} If value is not a valid positive integer
 * @private
 */
function parsePositiveInt(value, fieldName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new LeagueTeamSeasonValidationError(`${fieldName} is not a valid positive integer`);
  }
  return parsed;
}

/**
 * Parses an optional positive integer value.
 *
 * @function parseOptionalPositiveInt
 * @param {*} value - Value to parse
 * @param {string} fieldName - Name of the field for error messages
 * @returns {number|undefined} Parsed positive integer or undefined if value is empty
 * @throws {LeagueTeamSeasonValidationError} If value exists but is not a valid positive integer
 * @private
 */
function parseOptionalPositiveInt(value, fieldName) {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return undefined;
  }
  return parsePositiveInt(trimmed, fieldName);
}

/**
 * Builds a filter object from query parameters.
 *
 * @function buildFilter
 * @param {Object} [query={}] - Query parameters
 * @param {string|number} [query.leagueId] - League ID to filter by
 * @param {string|number} [query.teamId] - Team ID to filter by
 * @param {string|number} [query.season] - Season to filter by
 * @returns {Object} Filter object with validated parameters
 * @private
 */
function buildFilter(query = {}) {
  const filter = {};
  const leagueId = parseOptionalPositiveInt(query.leagueId, 'leagueId');
  const teamId = parseOptionalPositiveInt(query.teamId, 'teamId');
  const season = parseOptionalPositiveInt(query.season, 'season');

  if (leagueId !== undefined) {
    filter.leagueId = leagueId;
  }
  if (teamId !== undefined) {
    filter.teamId = teamId;
  }
  if (season !== undefined) {
    filter.season = season;
  }
  return filter;
}

/**
 * Lists league-team-season mappings with optional filtering.
 *
 * @async
 * @function listMappings
 * @param {Object} [query={}] - Query parameters for filtering
 * @param {string|number} [query.leagueId] - Filter by league ID
 * @param {string|number} [query.teamId] - Filter by team ID
 * @param {string|number} [query.season] - Filter by season
 * @returns {Promise<Array<Object>>} Array of mapping records
 */
export async function listMappings(query = {}) {
  const filter = buildFilter(query);
  return findMappings(filter, {
    attributes: LTS_ATTRIBUTES,
    order: [
      ['leagueId', 'ASC'],
      ['season', 'DESC'],
      ['teamId', 'ASC'],
    ],
  });
}

/**
 * Retrieves all teams participating in a specific league and season.
 *
 * @async
 * @function listTeamsForLeagueSeason
 * @param {string|number} rawLeagueId - The league ID
 * @param {string|number} rawSeason - The season year
 * @returns {Promise<Array<Object>>} Array of team objects sorted by name
 * @throws {LeagueTeamSeasonValidationError} If leagueId or season is invalid
 */
export async function listTeamsForLeagueSeason(rawLeagueId, rawSeason) {
  const leagueId = parsePositiveInt(rawLeagueId, 'leagueId');
  const season = parsePositiveInt(rawSeason, 'season');
  const records = await findTeamIdsByLeagueAndSeason(leagueId, season);

  if (!records.length) {
    return [];
  }

  const teamIds = [...new Set(records.map((record) => record.teamId))];
  if (!teamIds.length) {
    return [];
  }

  return Team.findAll({
    where: { id: { [Op.in]: teamIds } },
    attributes: TEAM_ATTRIBUTES,
    order: [['name', 'ASC']],
  });
}

/**
 * Removes a league-team-season mapping.
 *
 * @async
 * @function removeMapping
 * @param {string|number} rawLeagueId - The league ID
 * @param {string|number} rawTeamId - The team ID
 * @param {string|number} rawSeason - The season year
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {LeagueTeamSeasonValidationError} If any identifier is invalid
 * @throws {LeagueTeamSeasonValidationError} If the record does not exist (404)
 */
export async function removeMapping(rawLeagueId, rawTeamId, rawSeason) {
  const leagueId = parsePositiveInt(rawLeagueId, 'leagueId');
  const teamId = parsePositiveInt(rawTeamId, 'teamId');
  const season = parsePositiveInt(rawSeason, 'season');

  const deletedRows = await deleteMapping({ leagueId, teamId, season });
  if (!deletedRows) {
    throw new LeagueTeamSeasonValidationError('Record does not exist', 404);
  }
  return true;
}
