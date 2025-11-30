import router from './routes/postLikes.routes.js';
import PostLike from './models/postLike.model.js';
import * as PostLikesService from './services/postLikes.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

export default async function registerPostLikesModule({ container }) {
  registerIfMissing(container, TOKENS.models.PostLike, PostLike);
  container.set(TOKENS.services.postLikes, PostLikesService);

  return {
    name: 'postLikes',
    basePath: '/',
    routes: router,
    publicApi: {
      PostLike,
      services: PostLikesService,
    },
  };
}
