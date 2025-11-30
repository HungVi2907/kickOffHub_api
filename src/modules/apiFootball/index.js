import * as ApiFootballService from './services/apiFootball.service.js';
import { TOKENS } from '../../contracts/tokens.js';

export default async function registerApiFootballModule({ container }) {
  container.set(TOKENS.services.apiFootball, ApiFootballService);

  return {
    name: 'apiFootball',
    basePath: null,
    routes: null,
    publicApi: ApiFootballService,
  };
}
