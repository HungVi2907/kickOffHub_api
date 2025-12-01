/**
 * =============================================================================
 * FILE: src/modules/players/index.js
 * =============================================================================
 * 
 * @fileoverview Players Module Registration
 * 
 * @description
 * Module đăng ký cho Players feature.
 * Xử lý player CRUD, search, import từ API-Football và statistics.
 * 
 * ## Module Structure:
 * - models/: Sequelize Player model
 * - services/: Business logic với API-Football integration
 * - controllers/: HTTP request handlers
 * - routes/: Express route definitions
 * 
 * ## Dependencies:
 * - apiFootball service: External API client
 * - playerTeamLeagueSeason service: Relationship management
 * 
 * @module modules/players
 * @requires contracts/tokens
 * 
 * =============================================================================
 */

import router from './routes/players.routes.js';
import Player from './models/player.model.js';
import {
  initPlayersService,
  listPlayers,
  getPlayerDetails,
  searchPlayers,
  createPlayerRecord,
  updatePlayerRecord,
  removePlayerRecord,
  listPopularPlayers,
  importPlayersFromApi,
  getPlayerStats,
} from './services/players.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

// =============================================================================
// Module Registration
// =============================================================================

/**
 * Đăng ký Players module vào DI container.
 * Initialize service với external dependencies.
 * 
 * @async
 * @function registerPlayersModule
 * @param {Object} params - Module registration parameters
 * @param {Map} params.container - DI container
 * @returns {Promise<Object>} Module metadata
 */
export default async function registerPlayersModule({ container }) {
  // Đăng ký Player model
  registerIfMissing(container, TOKENS.models.Player, Player);
  
  // Lấy dependencies từ container
  const apiFootballService = container.get(TOKENS.services.apiFootball);
  
  // Lazy resolver cho playerTeamLeagueSeason (có thể chưa được đăng ký)
  const resolvePlayerTeamLeagueSeason = () => {
    if (container.has(TOKENS.services.playerTeamLeagueSeason)) {
      return container.get(TOKENS.services.playerTeamLeagueSeason);
    }
    return null;
  };
  
  // Initialize service với dependencies
  initPlayersService({
    apiFootball: apiFootballService,
    playerTeamLeagueSeason: resolvePlayerTeamLeagueSeason(),
    resolvePlayerTeamLeagueSeason,
  });

  // Build services object
  const services = {
    listPlayers,
    getPlayerDetails,
    searchPlayers,
    createPlayerRecord,
    updatePlayerRecord,
    removePlayerRecord,
    listPopularPlayers,
    importPlayersFromApi,
    getPlayerStats,
  };

  container.set(TOKENS.services.players, services);

  return {
    name: 'players',
    basePath: '/',
    routes: router,
    publicApi: {
      Player,
      services,
    },
  };
}
