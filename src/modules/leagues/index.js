/**
 * @fileoverview Leagues Module Registration
 * @description Entry point for the leagues module. Registers the League model,
 * service layer, and exposes public/private routes for league management.
 * @module modules/leagues
 */

import { publicRouter, privateRouter } from './routes/leagues.routes.js';
import League from './models/league.model.js';
import * as LeaguesService from './services/leagues.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

/**
 * Registers the leagues module with the application container.
 * Sets up dependency injection for League model and service,
 * and exposes routes and public API for other modules.
 *
 * @async
 * @function registerLeaguesModule
 * @param {Object} options - Registration options
 * @param {Object} options.container - Dependency injection container
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - Module identifier ('leagues')
 * @returns {string} returns.basePath - Base URL path for routes
 * @returns {Router} returns.publicRoutes - Express router for public endpoints
 * @returns {Router} returns.privateRoutes - Express router for authenticated endpoints
 * @returns {Object} returns.publicApi - Exposed API for inter-module communication
 */
export default async function registerLeaguesModule({ container }) {
  // Register League model if not already registered
  registerIfMissing(container, TOKENS.models.League, League);
  // Register leagues service in the container
  container.set(TOKENS.services.leagues, LeaguesService);

  return {
    name: 'leagues',
    basePath: '/',
    publicRoutes: publicRouter,
    privateRoutes: privateRouter,
    publicApi: {
      League,
      services: LeaguesService,
    },
  };
}
