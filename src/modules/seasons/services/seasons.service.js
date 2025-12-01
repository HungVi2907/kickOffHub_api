/**
 * @file Seasons Service
 * @description Business logic layer for managing seasons.
 * Provides functions to list, create, and remove season entries.
 * @module modules/seasons/services/seasons
 */

import {
  deleteSeason,
  findOrCreateSeason,
  listSeasonsOrdered,
} from '../repositories/seasons.repository.js';

/**
 * Parses and validates a raw season value.
 * Converts the input to a number and ensures it's a valid integer.
 *
 * @function parseSeasonValue
 * @param {string|number} raw - The raw season value to parse.
 * @returns {number} The parsed integer season value.
 * @throws {Error} Throws an error with statusCode 400 if the value is not a valid integer.
 * @private
 */
function parseSeasonValue(raw) {
  const parsed = Number(raw);

  // Validate that the parsed value is a valid integer
  if (!Number.isInteger(parsed)) {
    const error = new Error('SEASON_VALUE_INVALID');
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

/**
 * Retrieves all seasons from the database, ordered from most recent to oldest.
 *
 * @async
 * @function listSeasons
 * @returns {Promise<Array<Object>>} Array of season objects sorted in descending order.
 */
export async function listSeasons() {
  return listSeasonsOrdered();
}

/**
 * Creates a new season entry or returns existing one if it already exists.
 * Uses findOrCreate pattern to handle duplicate entries gracefully.
 *
 * @async
 * @function createSeasonEntry
 * @param {Object} [payload={}] - The payload containing season data.
 * @param {string|number} payload.season - The season year to create.
 * @returns {Promise<Object>} Object containing:
 *   - {Object} season - The season model instance.
 *   - {boolean} created - True if a new season was created, false if it existed.
 * @throws {Error} Throws an error with statusCode 400 if season value is invalid.
 */
export async function createSeasonEntry(payload = {}) {
  const seasonValue = parseSeasonValue(payload.season);
  const [season, created] = await findOrCreateSeason(seasonValue);
  return { season, created };
}

/**
 * Removes a season from the database.
 *
 * @async
 * @function removeSeason
 * @param {string|number} rawSeason - The season year to remove.
 * @returns {Promise<boolean>} Returns true if deletion was successful.
 * @throws {Error} Throws an error with statusCode 400 if season value is invalid.
 * @throws {Error} Throws an error with statusCode 404 if season is not found.
 */
export async function removeSeason(rawSeason) {
  const seasonValue = parseSeasonValue(rawSeason);
  const deletedRows = await deleteSeason(seasonValue);

  // Verify that a season was actually deleted
  if (!deletedRows) {
    const error = new Error('SEASON_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }

  return true;
}
