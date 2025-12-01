/**
 * =============================================================================
 * FILE: src/bootstrap/registerInfrastructure.js
 * =============================================================================
 * 
 * @fileoverview Infrastructure Services Registration
 * 
 * @description
 * File này đăng ký các infrastructure services cơ bản vào DI Container.
 * Infrastructure services là các services dùng chung cho toàn bộ application:
 * - Database connection (Sequelize)
 * - Cache/Queue (Redis)
 * - Logging (Pino)
 * 
 * ## Registered Services:
 * 
 * | Token       | Service         | Description                    |
 * |-------------|-----------------|--------------------------------|
 * | 'sequelize' | Sequelize       | ORM instance, database access  |
 * | 'redis'     | Redis Client    | Caching và message queues      |
 * | 'logger'    | Pino Logger     | Structured logging             |
 * 
 * ## Sử dụng trong modules:
 * 
 * ```javascript
 * export default async function registerMyModule({ container }) {
 *   const sequelize = container.get('sequelize');
 *   const logger = container.get('logger');
 *   // ...
 * }
 * ```
 * 
 * @module bootstrap/registerInfrastructure
 * @requires ../common/db.js
 * @requires ../common/redisClient.js
 * @requires ../common/logger.js
 * 
 * =============================================================================
 */

import sequelize from '../common/db.js';
import { redisClient } from '../common/redisClient.js';
import { logger } from '../common/logger.js';

/**
 * Đăng ký infrastructure services vào container
 * 
 * @function registerInfrastructure
 * @description
 * Hàm này được gọi một lần khi khởi động application,
 * đăng ký các shared services để các modules có thể sử dụng.
 * 
 * @param {Container} container - DI Container instance
 * @returns {void}
 * 
 * @example
 * const container = createContainer();
 * registerInfrastructure(container);
 * 
 * // Sau đó trong module
 * const db = container.get('sequelize');
 */
export default function registerInfrastructure(container) {
  // Đăng ký Sequelize instance - ORM cho MySQL/TiDB
  // Sử dụng để thực hiện các database operations
  container.set('sequelize', sequelize);
  
  // Đăng ký Redis client - In-memory data store
  // Sử dụng cho caching API responses và job queues (BullMQ)
  container.set('redis', redisClient);
  
  // Đăng ký Pino logger - Structured JSON logging
  // Sử dụng cho logging với context (request ID, module name, etc.)
  container.set('logger', logger);
}
