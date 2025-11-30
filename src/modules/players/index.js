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

export default async function registerPlayersModule({ container }) {
  registerIfMissing(container, TOKENS.models.Player, Player);
  const apiFootballService = container.get(TOKENS.services.apiFootball);
  const resolvePlayerTeamLeagueSeason = () => {
    if (container.has(TOKENS.services.playerTeamLeagueSeason)) {
      return container.get(TOKENS.services.playerTeamLeagueSeason);
    }
    return null;
  };
  initPlayersService({
    apiFootball: apiFootballService,
    playerTeamLeagueSeason: resolvePlayerTeamLeagueSeason(),
    resolvePlayerTeamLeagueSeason,
  });

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
