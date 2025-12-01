/**
 * @file Venues Module Entry Point
 * @description Registers the venues module with its model, service, and routes.
 * Provides venue (stadium) management functionality including API-Football import.
 * @module modules/venues
 */

import router from './routes/venues.routes.js';
import Venue from './models/venue.model.js';
import * as VenuesService from './services/venues.service.js';

/**
 * Registers the venues module with the application container.
 * @async
 * @function registerVenuesModule
 * @param {Object} params - Registration parameters
 * @param {Object} params.container - Dependency injection container
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - Module name ('venues')
 * @returns {string} returns.basePath - Base path for routes
 * @returns {Object} returns.routes - Express router instance
 * @returns {Object} returns.publicApi - Public API exports (Venue model, VenuesService)
 */
export default async function registerVenuesModule({ container }) {
  if (container && typeof container.set === 'function') {
    container.set('models.Venue', Venue);
    container.set('services.venues', VenuesService);
  }

  return {
    name: 'venues',
    basePath: '/',
    routes: router,
    publicApi: {
      Venue,
      services: VenuesService,
    },
  };
}
