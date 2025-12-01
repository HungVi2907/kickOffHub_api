/**
 * =============================================================================
 * FILE: src/common/logger.js
 * =============================================================================
 * 
 * @fileoverview Pino Logger Configuration
 * 
 * @description
 * File này cấu hình và export Pino logger instance.
 * Pino là một JSON logger cực nhanh, phù hợp cho production.
 * 
 * ## Features:
 * - Structured JSON logging
 * - Log levels (trace, debug, info, warn, error, fatal)
 * - Sensitive data redaction
 * - High performance
 * 
 * ## Log Levels:
 * | Level | Value | Description                    |
 * |-------|-------|--------------------------------|
 * | trace | 10    | Detailed tracing information   |
 * | debug | 20    | Debug information              |
 * | info  | 30    | Normal operational messages    |
 * | warn  | 40    | Warning messages               |
 * | error | 50    | Error messages                 |
 * | fatal | 60    | Fatal errors                   |
 * 
 * ## Environment Variables:
 * - LOG_LEVEL: Set minimum log level (default: 'info')
 * 
 * @module common/logger
 * @requires pino
 * 
 * @example
 * import { logger } from './common/logger.js';
 * 
 * logger.info('User logged in');
 * logger.error({ err, userId }, 'Failed to process request');
 * logger.warn({ origin }, 'Blocked by CORS');
 * 
 * =============================================================================
 */

import pino from 'pino';

/**
 * Log level từ environment variable
 * Mặc định là 'info' cho production
 * @type {string}
 */
const level = process.env.LOG_LEVEL || 'info';

/**
 * Pino logger instance
 * 
 * @type {pino.Logger}
 * @description
 * Logger được cấu hình với:
 * - Dynamic log level từ environment
 * - Redact sensitive data (auth headers, cookies)
 * 
 * ## Redacted Fields:
 * Các fields sau sẽ được thay thế bằng '[Redacted]' trong logs:
 * - req.headers.authorization (JWT tokens)
 * - req.headers.cookie (Session cookies)
 * 
 * @example
 * // Simple log
 * logger.info('Server started');
 * 
 * // Log with context object
 * logger.info({ userId: 123, action: 'login' }, 'User action');
 * 
 * // Error logging
 * logger.error({ err, requestId }, 'Request failed');
 */
export const logger = pino({
  level,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});

export default logger;
