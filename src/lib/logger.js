/**
 * =============================================================================
 * FILE: src/lib/logger.js
 * =============================================================================
 * 
 * @fileoverview Logger Re-export Module
 * 
 * @description
 * Re-export Pino logger từ common module.
 * Cung cấp convenient import path cho external usage.
 * 
 * @module lib/logger
 * @see module:common/logger
 * @exports {Object} logger - Named export
 * @exports {Object} default - Default export
 * 
 * @example
 * // Named import
 * import { logger } from './lib/logger.js';
 * logger.info('Hello');
 * 
 * // Default import
 * import logger from './lib/logger.js';
 * logger.error('Error occurred');
 * 
 * =============================================================================
 */

export { logger } from '../common/logger.js';
export { default } from '../common/logger.js';
