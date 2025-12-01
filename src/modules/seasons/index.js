/**
 * @file Seasons Module Entry Point
 * @description Registers the seasons module with the application's dependency injection container.
 * This module provides functionality for managing football/soccer seasons.
 * @module modules/seasons
 */

import router from './routes/seasons.routes.js';
import Season from './models/season.model.js';
import * as SeasonsService from './services/seasons.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

/**
 * Registers the seasons module with the application container.
 * Sets up the Season model and SeasonsService in the DI container,
 * and returns the module configuration including routes and public API.
 *
 * @async
 * @function registerSeasonsModule
 * @param {Object} options - Registration options.
 * @param {Object} options.container - The dependency injection container instance.
 * @returns {Promise<Object>} Module configuration object containing:
 *   - {string} name - The module name ('seasons').
 *   - {string} basePath - The base path for routes ('/').
 *   - {Router} routes - Express router with season endpoints.
 *   - {Object} publicApi - Public API exposing Season model and services.
 */
export default async function registerSeasonsModule({ container }) {
  // Register the Season model if not already registered
  registerIfMissing(container, TOKENS.models.Season, Season);

  // Register the seasons service in the container
  container.set(TOKENS.services.seasons, SeasonsService);

  return {
    name: 'seasons',
    basePath: '/',
    routes: router,
    publicApi: {
      Season,
      services: SeasonsService,
    },
  };
}
