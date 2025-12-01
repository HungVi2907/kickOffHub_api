/**
 * @file League-Team-Season Module Entry Point
 * @description Module registration for league-team-season relationship management.
 *              Handles the association between leagues, teams, and seasons.
 * @module modules/leagueTeamSeason
 */

import router from './routes/leagueTeamSeason.routes.js';
import LeagueTeamSeason from './models/leagueTeamSeason.model.js';
import * as LeagueTeamSeasonService from './services/leagueTeamSeason.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

/**
 * Registers the League-Team-Season module with the application container.
 * Sets up models, services, and routes for managing league-team-season relationships.
 *
 * @async
 * @function registerLeagueTeamSeasonModule
 * @param {Object} params - Registration parameters
 * @param {Object} params.container - Dependency injection container
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - Module name identifier
 * @returns {string} returns.basePath - Base URL path for routes
 * @returns {Router} returns.routes - Express router instance
 * @returns {Object} returns.publicApi - Publicly exposed module APIs
 * @returns {Model} returns.publicApi.LeagueTeamSeason - Sequelize model
 * @returns {Object} returns.publicApi.services - Service functions
 */
export default async function registerLeagueTeamSeasonModule({ container }) {
  registerIfMissing(container, TOKENS.models.LeagueTeamSeason, LeagueTeamSeason);
  container.set(TOKENS.services.leagueTeamSeason, LeagueTeamSeasonService);

  return {
    name: 'leagueTeamSeason',
    basePath: '/',
    routes: router,
    publicApi: {
      LeagueTeamSeason,
      services: LeagueTeamSeasonService,
    },
  };
}
