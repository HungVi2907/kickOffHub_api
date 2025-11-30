import { publicRouter, privateRouter } from './routes/posts.routes.js';
import Post from './models/post.model.js';
import './models/postTag.model.js';
import * as PostsService from './services/posts.service.js';
import { TOKENS } from '../../contracts/tokens.js';

export default async function registerPostsModule({ container }) {
  if (!container.has(TOKENS.models.Post)) {
    container.set(TOKENS.models.Post, Post);
  }

  container.set(TOKENS.services.posts, PostsService);

  return {
    name: 'posts',
    basePath: '/',
    publicRoutes: publicRouter,
    privateRoutes: privateRouter,
    publicApi: {
      Post,
      services: PostsService,
    },
  };
}
