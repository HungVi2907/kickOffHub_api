/**
 * @file Venues Service
 * @description Business logic layer for venue operations. Handles CRUD operations,
 * validation, and importing venue data from API-Football.
 * @module modules/venues/services/venues
 */

import { apiFootballGet } from '../../apiFootball/services/apiFootball.service.js';
import {
  findAllVenues,
  findVenueById,
  createVenueRecord,
  updateVenueRecord,
  deleteVenueRecord,
  bulkUpsertVenues,
} from '../repositories/venues.repository.js';

/**
 * Error messages for venue operations.
 * @constant {Object.<string, string>}
 */
const ERROR_MESSAGES = {
  INVALID_VENUE_ID: 'ID venue không hợp lệ',
  VENUE_NOT_FOUND: 'Venue không tồn tại',
  MISSING_ID: 'id là bắt buộc',
  INVALID_ID: 'id phải là số nguyên dương hợp lệ',
};

/**
 * Creates a standardized error with code and status.
 * @function createError
 * @param {string} code - Error code key from ERROR_MESSAGES or custom message
 * @param {number} [status=400] - HTTP status code
 * @param {*} [details] - Additional error details
 * @returns {Error} Error object with code, status, and optional details
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
 * Parses a value to a positive integer or returns null.
 * @function parsePositiveIntOrNull
 * @param {*} value - Value to parse
 * @returns {number|null} Positive integer or null if invalid/empty
 */
function parsePositiveIntOrNull(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

/**
 * Requires and validates a positive integer value.
 * @function requirePositiveInt
 * @param {*} value - Value to validate
 * @param {string} missingCode - Error code if value is missing
 * @param {string} invalidCode - Error code if value is invalid
 * @returns {number} Validated positive integer
 * @throws {Error} If value is missing or invalid
 */
function requirePositiveInt(value, missingCode, invalidCode) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw createError(missingCode, 400);
  }
  const parsed = parsePositiveIntOrNull(value);
  if (parsed === null) {
    throw createError(invalidCode, 400);
  }
  return parsed;
}

/**
 * Normalizes a string field by trimming whitespace.
 * @function normalizeStringField
 * @param {*} value - Value to normalize
 * @returns {string|null} Trimmed string or null if empty/undefined
 */
function normalizeStringField(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Parses an API value to an integer.
 * @function parseApiInteger
 * @param {*} value - Value to parse from API response
 * @returns {number|null} Parsed integer or null if invalid
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
 * Builds a venue database payload from API-Football response data.
 * @function buildVenuePayloadFromApi
 * @param {Object} venue - Venue object from API-Football
 * @param {number} venue.id - Venue ID
 * @param {string} venue.name - Venue name
 * @param {string} [venue.address] - Street address
 * @param {string} [venue.city] - City name
 * @param {number} [venue.capacity] - Seating capacity
 * @param {string} [venue.surface] - Playing surface type
 * @param {string} [venue.image] - Image URL
 * @returns {Object|null} Normalized venue payload or null if invalid
 */
function buildVenuePayloadFromApi(venue) {
  if (!venue) {
    return null;
  }
  const venueId = parseApiInteger(venue.id);
  if (!venueId) {
    return null;
  }
  const payload = {
    id: venueId,
    name: normalizeStringField(venue.name),
    address: normalizeStringField(venue.address),
    city: normalizeStringField(venue.city),
    capacity: parseApiInteger(venue.capacity),
    surface: normalizeStringField(venue.surface),
    image: normalizeStringField(venue.image),
  };
  if (!payload.name) {
    return null;
  }
  return payload;
}

/**
 * Retrieves all venues from the database.
 * @async
 * @function listVenues
 * @returns {Promise<Array<Object>>} Array of venue objects
 */
export async function listVenues() {
  return findAllVenues();
}

/**
 * Retrieves a venue by its ID.
 * @async
 * @function getVenueById
 * @param {string|number} rawId - Raw venue ID
 * @returns {Promise<Object>} Venue object
 * @throws {Error} If ID is invalid (400) or venue not found (404)
 */
export async function getVenueById(rawId) {
  const venueId = parsePositiveIntOrNull(rawId);
  if (venueId === null) {
    throw createError('INVALID_VENUE_ID');
  }
  const venue = await findVenueById(venueId);
  if (!venue) {
    throw createError('VENUE_NOT_FOUND', 404);
  }
  return venue;
}

/**
 * Creates a new venue record.
 * @async
 * @function createVenue
 * @param {Object} payload - Venue data
 * @param {string} payload.name - Venue name
 * @param {string} [payload.address] - Street address
 * @param {string} [payload.city] - City name
 * @param {number} [payload.capacity] - Seating capacity
 * @param {string} [payload.surface] - Playing surface type
 * @param {string} [payload.image] - Image URL
 * @returns {Promise<Object>} Created venue object
 */
export async function createVenue(payload) {
  return createVenueRecord(payload);
}

/**
 * Updates an existing venue record.
 * @async
 * @function updateVenue
 * @param {string|number} rawId - Raw venue ID
 * @param {Object} payload - Updated venue data
 * @returns {Promise<Object>} Updated venue object
 * @throws {Error} If ID is invalid (400) or venue not found (404)
 */
export async function updateVenue(rawId, payload) {
  const venueId = parsePositiveIntOrNull(rawId);
  if (venueId === null) {
    throw createError('INVALID_VENUE_ID');
  }
  const [updatedRows] = await updateVenueRecord(venueId, payload);
  if (updatedRows === 0) {
    throw createError('VENUE_NOT_FOUND', 404);
  }
  return findVenueById(venueId);
}

/**
 * Deletes a venue record.
 * @async
 * @function deleteVenue
 * @param {string|number} rawId - Raw venue ID
 * @throws {Error} If ID is invalid (400) or venue not found (404)
 */
export async function deleteVenue(rawId) {
  const venueId = parsePositiveIntOrNull(rawId);
  if (venueId === null) {
    throw createError('INVALID_VENUE_ID');
  }
  const deletedRows = await deleteVenueRecord(venueId);
  if (deletedRows === 0) {
    throw createError('VENUE_NOT_FOUND', 404);
  }
}

/**
 * Imports venue data from API-Football by venue ID.
 * @async
 * @function importVenuesFromApi
 * @param {Object} [params={}] - Import parameters
 * @param {number|string} params.id - Required venue ID to import
 * @returns {Promise<Object>} Import result
 * @returns {number} returns.imported - Number of venues imported
 * @returns {number} [returns.id] - Venue ID that was imported
 * @returns {string} [returns.message] - Message if no venues imported
 * @throws {Error} If ID is missing or invalid
 */
export async function importVenuesFromApi(params = {}) {
  const idValue = requirePositiveInt(params.id, 'MISSING_ID', 'INVALID_ID');
  const data = await apiFootballGet('/venues', { id: idValue });
  const apiVenues = Array.isArray(data?.response) ? data.response : [];

  if (apiVenues.length === 0) {
    return {
      imported: 0,
      message: 'Không có venue nào được trả về từ API-Football',
    };
  }

  const venuePayloads = apiVenues
    .map((venue) => buildVenuePayloadFromApi(venue))
    .filter((entry) => entry !== null);

  if (venuePayloads.length === 0) {
    return {
      imported: 0,
      message: 'Không có venue hợp lệ để lưu',
    };
  }

  await bulkUpsertVenues(venuePayloads);

  return {
    imported: venuePayloads.length,
    id: idValue,
  };
}
