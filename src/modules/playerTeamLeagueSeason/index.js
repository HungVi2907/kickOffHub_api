import router from './routes/playerTeamLeagueSeason.routes.js';
import PlayerTeamLeagueSeason from './models/playerTeamLeagueSeason.model.js';
import * as PlayerTeamLeagueSeasonService from './services/playerTeamLeagueSeason.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

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
