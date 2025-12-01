/**
 * @fileoverview Leagues Service Layer
 * @description Business logic for league management including CRUD operations
 * and search functionality. Handles validation, error handling, and data transformation.
 * @module modules/leagues/services/leagues
 */

import {
  createLeagueRecord,
  deleteLeagueById,
  findAllLeagues,
  findLeagueById,
  searchLeaguesByKeyword,
  updateLeagueRecord,
} from '../repositories/leagues.repository.js';

/** @constant {string[]} LEAGUE_ATTRIBUTES - Attributes to include in league queries */
const LEAGUE_ATTRIBUTES = ['id', 'name', 'type', 'logo'];

/** @constant {number} DEFAULT_SEARCH_LIMIT - Default number of results per search page */
const DEFAULT_SEARCH_LIMIT = 20;

/** @constant {number} MAX_SEARCH_LIMIT - Maximum allowed results per search page */
const MAX_SEARCH_LIMIT = 100;

/**
 * Parses a value to a positive integer.
 * @private
 * @param {*} value - Value to parse
 * @returns {number|null} Parsed positive integer or null if invalid
 */
function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Validates and normalizes a league ID.
 * @private
 * @param {*} rawId - Raw league ID input
 * @returns {number} Validated positive integer ID
 * @throws {Error} LEAGUE_ID_INVALID if ID is not a valid positive integer (statusCode: 400)
 */
function normalizeLeagueId(rawId) {
  const id = parsePositiveInt(rawId);
  if (!id) {
    const error = new Error('LEAGUE_ID_INVALID');
    error.statusCode = 400;
    throw error;
  }
  return id;
}

/**
 * Validates a league name.
 * @private
 * @param {*} name - League name to validate
 * @returns {string|undefined} Trimmed name or undefined if not provided
 * @throws {Error} LEAGUE_NAME_REQUIRED if name is provided but empty (statusCode: 400)
 */
function validateName(name) {
  if (name === undefined) {
    return undefined;
  }
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) {
    const error = new Error('LEAGUE_NAME_REQUIRED');
    error.statusCode = 400;
    throw error;
  }
  return trimmed;
}

/**
 * Retrieves all leagues from the database.
 * @async
 * @function listLeagues
 * @returns {Promise<Array<Object>>} Array of league objects with id, name, type, and logo
 */
export async function listLeagues() {
  return findAllLeagues(LEAGUE_ATTRIBUTES);
}

/**
 * Fetches a single league by its ID.
 * @async
 * @function fetchLeagueById
 * @param {string|number} rawId - League ID to fetch
 * @returns {Promise<Object>} League object with id, name, type, and logo
 * @throws {Error} LEAGUE_ID_INVALID if ID is not a valid positive integer (statusCode: 400)
 * @throws {Error} LEAGUE_NOT_FOUND if league does not exist (statusCode: 404)
 */
export async function fetchLeagueById(rawId) {
  const id = normalizeLeagueId(rawId);
  const league = await findLeagueById(id, LEAGUE_ATTRIBUTES);
  if (!league) {
    const error = new Error('LEAGUE_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return league;
}

/**
 * Creates a new league record.
 * @async
 * @function createLeague
 * @param {Object} payload - League creation data
 * @param {number} payload.id - Unique league identifier
 * @param {string} payload.name - League name (required)
 * @param {string} [payload.type] - League type (optional)
 * @param {string} [payload.logo] - Logo URL (optional)
 * @returns {Promise<Object>} Created league object with id, name, type, and logo
 * @throws {Error} LEAGUE_ID_INVALID if ID is not a valid positive integer (statusCode: 400)
 * @throws {Error} LEAGUE_NAME_REQUIRED if name is empty (statusCode: 400)
 */
export async function createLeague(payload) {
  const id = normalizeLeagueId(payload?.id);
  const name = validateName(payload?.name);
  // Create league record with validated data
  const league = await createLeagueRecord({
    id,
    name,
    type: payload?.type,
    logo: payload?.logo,
  });
  // Return the newly created league with selected attributes
  return findLeagueById(league.id, LEAGUE_ATTRIBUTES);
} return findLeagueById(league.id, LEAGUE_ATTRIBUTES);
}

/**
 * Updates an existing league record.
 * @async
 * @function updateLeague
 * @param {string|number} rawId - League ID to update
 * @param {Object} [payload={}] - Fields to update
 * @param {string} [payload.name] - New league name
 * @param {string} [payload.type] - New league type
 * @param {string} [payload.logo] - New logo URL
 * @returns {Promise<Object>} Updated league object with id, name, type, and logo
 * @throws {Error} LEAGUE_ID_INVALID if ID is not a valid positive integer (statusCode: 400)
 * @throws {Error} LEAGUE_NAME_REQUIRED if name is provided but empty (statusCode: 400)
 * @throws {Error} LEAGUE_UPDATE_EMPTY if no valid update fields provided (statusCode: 400)
 * @throws {Error} LEAGUE_NOT_FOUND if league does not exist (statusCode: 404)
 */
export async function updateLeague(rawId, payload = {}) {
  const id = normalizeLeagueId(rawId);
  const updates = {};

  // Build updates object with only provided fields
  if (payload.name !== undefined) {
    updates.name = validateName(payload.name);
  }
  if (payload.type !== undefined) {
    updates.type = payload.type;
  }
  if (payload.logo !== undefined) {
    updates.logo = payload.logo;
  }

  // Ensure at least one field is being updated
  if (!Object.keys(updates).length) {
    const error = new Error('LEAGUE_UPDATE_EMPTY');
    error.statusCode = 400;
    throw error;
  }

  // Perform update and check if record existed
  const [affected] = await updateLeagueRecord(id, updates);
  if (!affected) {
    const notFound = new Error('LEAGUE_NOT_FOUND');
    notFound.statusCode = 404;
    throw notFound;
  }

  return findLeagueById(id, LEAGUE_ATTRIBUTES);
}

/**
 * Removes a league by its ID.
 * @async
 * @function removeLeague
 * @param {string|number} rawId - League ID to delete
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {Error} LEAGUE_ID_INVALID if ID is not a valid positive integer (statusCode: 400)
 * @throws {Error} LEAGUE_NOT_FOUND if league does not exist (statusCode: 404)
 */
export async function removeLeague(rawId) {
  const id = normalizeLeagueId(rawId);
  const deleted = await deleteLeagueById(id);
  if (!deleted) {
    const error = new Error('LEAGUE_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return true;
}

/**
 * Searches leagues by keyword with pagination support.
 * @async
 * @function searchLeagues
 * @param {string} keywordRaw - Search keyword (will be trimmed and lowercased)
 * @param {Object} [options={}] - Search options
 * @param {number|string} [options.limit] - Results per page (default: 20, max: 100)
 * @param {number|string} [options.page] - Page number (default: 1)
 * @returns {Promise<Object>} Search results with pagination
 * @returns {Array<Object>} returns.results - Array of matching leagues
 * @returns {Object} returns.pagination - Pagination metadata
 * @returns {number} returns.pagination.totalItems - Total matching records
 * @returns {number} returns.pagination.totalPages - Total number of pages
 * @returns {number} returns.pagination.page - Current page number
 * @returns {number} returns.pagination.limit - Results per page
 * @returns {string} returns.keyword - Normalized search keyword
 * @throws {Error} LEAGUE_KEYWORD_REQUIRED if keyword is empty (statusCode: 400)
 * @throws {Error} LEAGUE_LIMIT_TOO_LARGE if limit exceeds maximum (statusCode: 400)
 * @throws {Error} LEAGUE_PAGE_INVALID if page is not a valid positive integer (statusCode: 400)
 */
export async function searchLeagues(keywordRaw, { limit: limitRaw, page: pageRaw } = {}) {
  // Normalize and validate search keyword
  const keyword = typeof keywordRaw === 'string' ? keywordRaw.trim() : '';
  if (!keyword) {
    const error = new Error('LEAGUE_KEYWORD_REQUIRED');
    error.statusCode = 400;
    throw error;
  }

  // Parse and validate pagination limit
  let limit = parsePositiveInt(limitRaw ?? DEFAULT_SEARCH_LIMIT) ?? DEFAULT_SEARCH_LIMIT;
  if (limit > MAX_SEARCH_LIMIT) {
    const error = new Error('LEAGUE_LIMIT_TOO_LARGE');
    error.statusCode = 400;
    throw error;
  }

  // Parse and validate page number
  let page = parsePositiveInt(pageRaw ?? 1);
  if (!page) {
    const error = new Error('LEAGUE_PAGE_INVALID');
    error.statusCode = 400;
    throw error;
  }

  // Calculate offset for pagination
  const offset = (page - 1) * limit;
  
  // Execute search query with pagination
  const { rows, count } = await searchLeaguesByKeyword(keyword.toLowerCase(), {
    limit,
    offset,
    attributes: LEAGUE_ATTRIBUTES,
  });

  // Return results with pagination metadata
  return {
    results: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      page,
      limit,
    },
    keyword,
  };
}
