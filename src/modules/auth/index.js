import router from './routes/auth.routes.js';
import * as AuthService from './services/auth.service.js';
import { TOKENS } from '../../contracts/tokens.js';

export default async function registerAuthModule({ container }) {
  container.set(TOKENS.services.auth, AuthService);

  return {
    name: 'auth',
    basePath: '/',
    routes: router,
    publicApi: {
      services: AuthService,
    },
  };
}
