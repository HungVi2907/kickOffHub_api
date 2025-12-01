/**
 * =============================================================================
 * FILE: src/common/redisClient.js
 * =============================================================================
 * 
 * @fileoverview Redis Client Configuration với Graceful Fallback
 * 
 * @description
 * File này cung cấp Redis client cho caching và message queues.
 * Đặc biệt, nếu REDIS_URL không được cấu hình, sẽ trả về một noop client
 * cho phép app hoạt động bình thường mà không cần Redis.
 * 
 * ## Features:
 * - Auto-reconnect với exponential backoff
 * - Graceful fallback khi Redis không available
 * - Noop client cho development environment
 * 
 * ## Environment Variables:
 * - REDIS_URL: Redis connection URL (optional)
 *   Format: redis://username:password@host:port
 * 
 * ## Reconnect Strategy:
 * - Retry tối đa 8 lần
 * - Backoff: retries * 50ms (max 1000ms)
 * - Sau 8 retries, stop reconnecting
 * 
 * @module common/redisClient
 * @requires redis
 * 
 * @example
 * import { redisClient, connectRedis } from './common/redisClient.js';
 * 
 * // Connect (trong startup)
 * await connectRedis();
 * 
 * // Sử dụng
 * await redisClient.set('key', 'value');
 * const value = await redisClient.get('key');
 * 
 * =============================================================================
 */

import { createClient } from 'redis';

/**
 * Redis URL từ environment variable
 * @type {string|undefined}
 */
const redisUrl = process.env.REDIS_URL;

/**
 * Message hiển thị khi Redis bị disabled
 * @constant {string}
 */
const redisDisabledMessage = 'Redis is disabled. Set REDIS_URL to enable caching/queues.';

/**
 * Tạo noop (no-operation) Redis client
 * 
 * @function createNoopRedisClient
 * @description
 * Trả về một object có cùng interface với Redis client,
 * nhưng tất cả methods đều return giá trị mặc định.
 * Cho phép code sử dụng Redis hoạt động bình thường
 * mà không cần kiểm tra Redis có available không.
 * 
 * @returns {Object} Noop Redis client
 */
function createNoopRedisClient() {
  return {
    isOpen: false,
    async connect() {
      console.warn(redisDisabledMessage);
    },
    async disconnect() {},
    async quit() {},
    async get() {
      return null;  // Luôn trả về null (cache miss)
    },
    async set() {
      return null;  // Không làm gì
    },
    async del() {
      return 0;     // Trả về 0 keys deleted
    },
    async keys() {
      return [];    // Trả về empty array
    },
    on() {
      return this;  // Chainable, không làm gì
    },
  };
}

/**
 * Redis client instance
 * 
 * @type {RedisClientType|Object}
 * @description
 * Nếu REDIS_URL được set: Real Redis client với auto-reconnect
 * Nếu không: Noop client không làm gì
 */
export const redisClient = redisUrl
  ? createClient({
      url: redisUrl,
      socket: {
        /**
         * Reconnect strategy với exponential backoff
         * @param {number} retries - Số lần đã retry
         * @returns {number|Error} Delay time hoặc Error để stop retry
         */
        reconnectStrategy(retries) {
          // Sau 8 lần retry, stop reconnecting
          if (retries > 8) {
            return new Error('Redis reconnect attempts exhausted');
          }
          // Backoff: 50ms, 100ms, 150ms, ... max 1000ms
          return Math.min(retries * 50, 1000);
        },
      },
    })
  : createNoopRedisClient();

// Warn nếu Redis không được cấu hình
if (!redisUrl) {
  console.warn('REDIS_URL is not set. Redis-dependent features are disabled for this run.');
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handle Redis errors
 * Log error nhưng không crash app
 */
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

/**
 * Track connection ready state
 * @type {boolean}
 */
let isReady = false;

/**
 * Handle Redis ready event
 */
redisClient.on('ready', () => {
  isReady = true;
  console.log('Redis connected');
});

// =============================================================================
// EXPORTED FUNCTIONS
// =============================================================================

/**
 * Connect to Redis server
 * 
 * @async
 * @function connectRedis
 * @description
 * Thiết lập connection tới Redis server.
 * Idempotent - gọi nhiều lần không tạo multiple connections.
 * 
 * @returns {Promise<RedisClientType>} Redis client instance
 * 
 * @example
 * // Trong server startup
 * await connectRedis().catch(err => {
 *   console.warn('Redis not available:', err.message);
 * });
 */
export async function connectRedis() {
  // Nếu không có Redis URL, return noop client
  if (!redisUrl) {
    return redisClient;
  }

  // Nếu đã ready, return ngay
  if (isReady) {
    return redisClient;
  }

  // Nếu chưa open, connect
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
}

/**
 * Get Redis connection status
 * 
 * @function getRedisStatus
 * @description
 * Trả về trạng thái hiện tại của Redis connection.
 * Hữu ích cho health checks và monitoring.
 * 
 * @returns {Object} Status object
 * @returns {boolean} returns.isReady - Redis đã sẵn sàng nhận commands
 * @returns {boolean} returns.isOpen - Socket đang mở
 * 
 * @example
 * const { isReady, isOpen } = getRedisStatus();
 * if (!isReady) {
 *   // Fallback to non-cached behavior
 * }
 */
export function getRedisStatus() {
  return {
    isReady,
    isOpen: redisClient.isOpen,
  };
}

export default redisClient;
