import { publicRouter, privateRouter } from './routes/leagues.routes.js';
import League from './models/league.model.js';
import * as LeaguesService from './services/leagues.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

export default async function registerLeaguesModule({ container }) {
  registerIfMissing(container, TOKENS.models.League, League);
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
