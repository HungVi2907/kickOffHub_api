/**
 * =============================================================================
 * FILE: src/common/httpClient.js
 * =============================================================================
 * 
 * @fileoverview Axios HTTP Client Factory
 * 
 * @description
 * File này cung cấp factory function để tạo Axios HTTP clients.
 * Cho phép tạo multiple clients với configurations khác nhau.
 * 
 * ## Default Configuration:
 * - Timeout: 10 seconds (configurable via HTTP_CLIENT_TIMEOUT)
 * 
 * ## Environment Variables:
 * - HTTP_CLIENT_TIMEOUT: Request timeout in milliseconds (default: 10000)
 * 
 * @module common/httpClient
 * @requires axios
 * 
 * @example
 * import { createHttpClient } from './common/httpClient.js';
 * 
 * // Custom client với base URL
 * const apiClient = createHttpClient({
 *   baseURL: 'https://api.example.com',
 *   headers: { 'X-API-Key': 'secret' }
 * });
 * 
 * // Default client
 * import { httpClient } from './common/httpClient.js';
 * const response = await httpClient.get('/endpoint');
 * 
 * =============================================================================
 */

import axios from 'axios';

/**
 * Default timeout từ environment variable
 * @constant {number}
 */
const defaultTimeout = Number(process.env.HTTP_CLIENT_TIMEOUT || 10000);

/**
 * Factory function để tạo Axios HTTP client
 * 
 * @function createHttpClient
 * @description
 * Tạo một Axios instance với default configuration.
 * Cho phép override bất kỳ Axios config nào.
 * 
 * @param {Object} [config={}] - Axios configuration object
 * @param {number} [config.timeout] - Request timeout in ms
 * @param {string} [config.baseURL] - Base URL for all requests
 * @param {Object} [config.headers] - Default headers
 * @returns {AxiosInstance} Configured Axios instance
 * 
 * @example
 * // API-Football client
 * const footballApi = createHttpClient({
 *   baseURL: 'https://v3.football.api-sports.io',
 *   headers: {
 *     'x-apisports-key': process.env.API_FOOTBALL_KEY
 *   },
 *   timeout: 15000
 * });
 */
export function createHttpClient(config = {}) {
  return axios.create({
    timeout: defaultTimeout,
    ...config,  // Override với custom config
  });
}

/**
 * Default HTTP client instance
 * Sử dụng cho general-purpose HTTP requests
 * @type {AxiosInstance}
 */
export const httpClient = createHttpClient();

export default httpClient;
