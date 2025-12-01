/**
 * =============================================================================
 * FILE: src/utils/fetchApiFootball.js
 * =============================================================================
 * 
 * @fileoverview API-Football Data Fetching Utilities
 * 
 * @description
 * Utility functions để fetch data từ API-Football service.
 * Wrapper cho các common API calls.
 * 
 * ## API-Football:
 * - External API cung cấp football data
 * - Countries, leagues, teams, players, etc.
 * - Require API key và rate limiting
 * 
 * @module utils/fetchApiFootball
 * @requires modules/apiFootball/services/apiFootball.service
 * 
 * @example
 * import { fetchCountries } from './utils/fetchApiFootball.js';
 * 
 * const countries = await fetchCountries();
 * console.log(countries); // [{ name: 'England', code: 'GB', ... }, ...]
 * 
 * =============================================================================
 */

import { apiFootballGet } from '../modules/apiFootball/services/apiFootball.service.js';

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetch danh sách countries từ API-Football.
 * 
 * @async
 * @function fetchCountries
 * @returns {Promise<Array>} Array các country objects
 * @throws {Error} Nếu API call fails
 * 
 * @description
 * Gọi API-Football endpoint /countries để lấy danh sách
 * tất cả các quốc gia có football data.
 * 
 * @example
 * const countries = await fetchCountries();
 * // Returns: [{ name: 'England', code: 'GB', flag: '...' }, ...]
 */
export async function fetchCountries() {
  try {
    const data = await apiFootballGet('/countries');
    return data.response;
  } catch (error) {
    throw new Error('Failed to fetch countries from API-Football');
  }
}
