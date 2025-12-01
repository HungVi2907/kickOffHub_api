/**
 * =============================================================================
 * FILE: src/lib/redisClient.js
 * =============================================================================
 * 
 * @fileoverview Redis Client Re-export Module
 * 
 * @description
 * Re-export Redis client từ common module.
 * Cung cấp convenient import path cho external usage.
 * 
 * @module lib/redisClient
 * @see module:common/redisClient
 * @exports {Object} redisClient - Redis client instance
 * @exports {Function} connectRedis - Connection function
 * @exports {Function} getRedisStatus - Status check function
 * @exports {Object} default - Default export (redisClient)
 * 
 * @example
 * import { redisClient, getRedisStatus } from './lib/redisClient.js';
 * 
 * const status = getRedisStatus();
 * if (status === 'ready') {
 *   await redisClient.set('key', 'value');
 * }
 * 
 * =============================================================================
 */

export { redisClient, connectRedis, getRedisStatus } from '../common/redisClient.js';
export { default } from '../common/redisClient.js';
