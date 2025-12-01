/**
 * @file API Football Service
 * @description Service layer for interacting with the API-Football external API.
 *              Implements caching via Redis and circuit breaker pattern for resilience.
 * @module modules/apiFootball/services/apiFootball.service
 */

import CircuitBreaker from 'opossum';
import crypto from 'node:crypto';
import { createHttpClient } from '../../../common/httpClient.js';
import { redisClient } from '../../../common/redisClient.js';
import { logger } from '../../../common/logger.js';

/**
 * Base URL for the API-Football service
 * @constant {string}
 */
const API_BASE_URL = 'https://v3.football.api-sports.io';

/**
 * Default cache TTL in seconds for API responses
 * @constant {number}
 */
const cacheTtl = Number.parseInt(process.env.API_FOOTBALL_CACHE_TTL ?? '300', 10);

/**
 * Configured HTTP client for API-Football requests
 * @type {Object}
 */
const api = createHttpClient({
  baseURL: API_BASE_URL,
  headers: {
    'x-apisports-key': process.env.API_FOOTBALL_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io',
  },
  timeout: Number.parseInt(process.env.API_FOOTBALL_TIMEOUT ?? '10000', 10),
});

/**
 * Circuit breaker configuration options
 * @type {Object}
 * @property {number} timeout - Request timeout in milliseconds
 * @property {number} errorThresholdPercentage - Error percentage threshold to open circuit
 * @property {number} resetTimeout - Time in ms before attempting to close circuit
 */
const breakerOptions = {
  timeout: Number.parseInt(process.env.API_FOOTBALL_BREAKER_TIMEOUT ?? '12000', 10),
  errorThresholdPercentage: Number.parseInt(process.env.API_FOOTBALL_BREAKER_THRESHOLD ?? '50', 10),
  resetTimeout: Number.parseInt(process.env.API_FOOTBALL_BREAKER_RESET_TIMEOUT ?? '30000', 10),
};

/**
 * Circuit breaker instance wrapping API-Football HTTP requests.
 * Provides fault tolerance by opening the circuit when error threshold is exceeded.
 * @type {CircuitBreaker}
 */
const breaker = new CircuitBreaker(async ({ method = 'get', path, params, data }) => {
  const response = await api.request({ method, url: path, params, data });
  return response.data;
}, breakerOptions);

breaker.on('open', () => logger.warn('API Football circuit breaker opened'));
breaker.on('close', () => logger.info('API Football circuit breaker closed'));
breaker.on('halfOpen', () => logger.info('API Football circuit breaker half-open'));
breaker.on('timeout', () => logger.warn('API Football request timed out'));

/**
 * Builds a unique cache key for API requests based on path and parameters.
 *
 * @function buildCacheKey
 * @param {string} path - The API endpoint path
 * @param {Object} [params] - Query parameters for the request
 * @returns {string} A unique cache key prefixed with 'api-football:'
 * @private
 */
function buildCacheKey(path, params) {
  const hash = crypto.createHash('sha1');
  hash.update(path);
  hash.update(JSON.stringify(params || {}));
  return `api-football:${hash.digest('hex')}`;
}

/**
 * Performs a GET request to the API-Football service with caching support.
 *
 * @async
 * @function apiFootballGet
 * @param {string} path - The API endpoint path to request
 * @param {Object} [params={}] - Query parameters for the request
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.cacheKey] - Custom cache key (auto-generated if not provided)
 * @param {number} [options.ttl] - Custom TTL in seconds (uses default if not provided)
 * @returns {Promise<Object>} The API response data
 * @example
 * // Get teams for a specific league and season
 * const data = await apiFootballGet('/teams', { league: 39, season: 2023 });
 */
export async function apiFootballGet(path, params = {}, { cacheKey, ttl } = {}) {
  const shouldCache = cacheTtl > 0;
  const resolvedTtl = ttl ?? cacheTtl;
  const key = cacheKey ?? buildCacheKey(path, params);

  if (shouldCache && redisClient.isOpen) {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const data = await breaker.fire({ method: 'get', path, params });

  if (shouldCache && redisClient.isOpen) {
    await redisClient.set(key, JSON.stringify(data), { EX: resolvedTtl });
  }

  return data;
}

/**
 * Performs a flexible HTTP request to the API-Football service with optional caching.
 * Supports all HTTP methods but only caches GET requests.
 *
 * @async
 * @function apiFootballRequest
 * @param {Object} [options={}] - Request options
 * @param {string} [options.method='get'] - HTTP method (get, post, put, delete, etc.)
 * @param {string} options.path - The API endpoint path (required)
 * @param {Object} [options.params={}] - Query parameters for the request
 * @param {*} [options.data] - Request body data (for POST, PUT, etc.)
 * @param {boolean} [options.cache=true] - Whether to enable caching (only applies to GET)
 * @param {number} [options.ttl] - Custom TTL in seconds for caching
 * @param {string} [options.cacheKey] - Custom cache key
 * @returns {Promise<Object>} The API response data
 * @throws {Error} Throws error with statusCode 400 if path is not provided
 * @example
 * // Simple GET request
 * const leagues = await apiFootballRequest({ path: '/leagues' });
 *
 * // GET request with parameters and custom TTL
 * const players = await apiFootballRequest({
 *   path: '/players',
 *   params: { team: 33, season: 2023 },
 *   ttl: 3600
 * });
 */
export async function apiFootballRequest(options = {}) {
  const {
    method = 'get',
    path,
    params = {},
    data,
    cache = true,
    ttl,
    cacheKey,
  } = options;

  if (!path) {
    const error = new Error('API_FOOTBALL_PATH_REQUIRED');
    error.statusCode = 400;
    throw error;
  }

  const shouldCache = cache && cacheTtl > 0 && method.toLowerCase() === 'get';
  const resolvedTtl = ttl ?? cacheTtl;
  const resolvedKey = cacheKey ?? buildCacheKey(`${method}:${path}`, params);

  if (shouldCache && redisClient.isOpen) {
    const cached = await redisClient.get(resolvedKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const payload = await breaker.fire({ method, path, params, data });

  if (shouldCache && redisClient.isOpen) {
    await redisClient.set(resolvedKey, JSON.stringify(payload), { EX: resolvedTtl });
  }

  return payload;
}

/**
 * Exported circuit breaker instance for API-Football requests.
 * Can be used to monitor circuit state or attach additional event listeners.
 * @type {CircuitBreaker}
 */
export { breaker as apiFootballBreaker };
