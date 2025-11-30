import router from './routes/seasons.routes.js';
import Season from './models/season.model.js';
import * as SeasonsService from './services/seasons.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

export default async function registerSeasonsModule({ container }) {
  registerIfMissing(container, TOKENS.models.Season, Season);
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
