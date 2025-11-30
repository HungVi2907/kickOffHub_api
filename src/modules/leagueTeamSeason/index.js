import router from './routes/leagueTeamSeason.routes.js';
import LeagueTeamSeason from './models/leagueTeamSeason.model.js';
import * as LeagueTeamSeasonService from './services/leagueTeamSeason.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

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
