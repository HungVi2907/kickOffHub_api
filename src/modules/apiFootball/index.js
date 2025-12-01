/**
 * @file API Football Module
 * @description Module registration for the API Football service integration.
 *              Provides access to external football data APIs with caching and circuit breaker support.
 * @module modules/apiFootball
 */

import * as ApiFootballService from './services/apiFootball.service.js';
import { TOKENS } from '../../contracts/tokens.js';

/**
 * Registers the API Football module with the dependency injection container.
 *
 * @async
 * @function registerApiFootballModule
 * @param {Object} options - Registration options
 * @param {Object} options.container - The dependency injection container instance
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - The module name ('apiFootball')
 * @returns {null} returns.basePath - No HTTP routes for this module
 * @returns {null} returns.routes - No route definitions for this module
 * @returns {Object} returns.publicApi - The API Football service methods
 */
export default async function registerApiFootballModule({ container }) {
  container.set(TOKENS.services.apiFootball, ApiFootballService);

  return {
    name: 'apiFootball',
    basePath: null,
    routes: null,
    publicApi: ApiFootballService,
  };
}
