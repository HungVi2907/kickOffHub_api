import CircuitBreaker from 'opossum';
import crypto from 'node:crypto';
import { createHttpClient } from '../../../common/httpClient.js';
import { redisClient } from '../../../common/redisClient.js';
import { logger } from '../../../common/logger.js';

const API_BASE_URL = 'https://v3.football.api-sports.io';
const cacheTtl = Number.parseInt(process.env.API_FOOTBALL_CACHE_TTL ?? '300', 10);

const api = createHttpClient({
  baseURL: API_BASE_URL,
  headers: {
    'x-apisports-key': process.env.API_FOOTBALL_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io',
  },
  timeout: Number.parseInt(process.env.API_FOOTBALL_TIMEOUT ?? '10000', 10),
});

const breakerOptions = {
  timeout: Number.parseInt(process.env.API_FOOTBALL_BREAKER_TIMEOUT ?? '12000', 10),
  errorThresholdPercentage: Number.parseInt(process.env.API_FOOTBALL_BREAKER_THRESHOLD ?? '50', 10),
  resetTimeout: Number.parseInt(process.env.API_FOOTBALL_BREAKER_RESET_TIMEOUT ?? '30000', 10),
};

const breaker = new CircuitBreaker(async ({ method = 'get', path, params, data }) => {
  const response = await api.request({ method, url: path, params, data });
  return response.data;
}, breakerOptions);

breaker.on('open', () => logger.warn('API Football circuit breaker opened'));
breaker.on('close', () => logger.info('API Football circuit breaker closed'));
breaker.on('halfOpen', () => logger.info('API Football circuit breaker half-open'));
breaker.on('timeout', () => logger.warn('API Football request timed out'));

function buildCacheKey(path, params) {
  const hash = crypto.createHash('sha1');
  hash.update(path);
  hash.update(JSON.stringify(params || {}));
  return `api-football:${hash.digest('hex')}`;
}

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

export { breaker as apiFootballBreaker };
