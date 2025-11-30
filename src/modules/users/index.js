import router from './routes/users.routes.js';
import User from './models/user.model.js';
import * as UsersService from './services/users.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

export default async function registerUsersModule({ container }) {
  registerIfMissing(container, TOKENS.models.User, User);
  container.set(TOKENS.services.users, UsersService);

  return {
    name: 'users',
    basePath: '/',
    routes: router,
    publicApi: {
      User,
      services: UsersService,
    },
  };
}
