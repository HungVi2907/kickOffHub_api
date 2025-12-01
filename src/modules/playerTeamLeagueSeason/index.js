/**
 * @file Player-Team-League-Season Module Entry Point
 * @description Module registration for player-team-league-season relationship management.
 *              Handles the association between players, teams, leagues, and seasons.
 * @module modules/playerTeamLeagueSeason
 */

import router from './routes/playerTeamLeagueSeason.routes.js';
import PlayerTeamLeagueSeason from './models/playerTeamLeagueSeason.model.js';
import * as PlayerTeamLeagueSeasonService from './services/playerTeamLeagueSeason.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

/**
 * Registers the Player-Team-League-Season module with the application container.
 * Sets up models, services, and routes for managing player-team-league-season relationships.
 *
 * @async
 * @function registerPlayerTeamLeagueSeasonModule
 * @param {Object} params - Registration parameters
 * @param {Object} params.container - Dependency injection container
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - Module name identifier
 * @returns {string} returns.basePath - Base URL path for routes
 * @returns {Router} returns.routes - Express router instance
 * @returns {Object} returns.publicApi - Publicly exposed module APIs
 * @returns {Model} returns.publicApi.PlayerTeamLeagueSeason - Sequelize model
 * @returns {Object} returns.publicApi.services - Service functions
 */
export default async function registerPlayerTeamLeagueSeasonModule({ container }) {
  registerIfMissing(container, TOKENS.models.PlayerTeamLeagueSeason, PlayerTeamLeagueSeason);
  container.set(TOKENS.services.playerTeamLeagueSeason, PlayerTeamLeagueSeasonService);

  return {
    name: 'playerTeamLeagueSeason',
    basePath: '/',
    routes: router,
    publicApi: {
      PlayerTeamLeagueSeason,
      services: PlayerTeamLeagueSeasonService,
    },
  };
}
