/**
 * @file Post Likes Module Entry Point
 * @description Registers the post likes module with its model, service, and routes.
 * Provides functionality for users to like/unlike forum posts.
 * @module modules/postLikes
 */

import router from './routes/postLikes.routes.js';
import PostLike from './models/postLike.model.js';
import * as PostLikesService from './services/postLikes.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

/**
 * Registers the post likes module with the application container.
 * @async
 * @function registerPostLikesModule
 * @param {Object} params - Registration parameters
 * @param {Object} params.container - Dependency injection container
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - Module name ('postLikes')
 * @returns {string} returns.basePath - Base path for routes
 * @returns {Object} returns.routes - Express router instance
 * @returns {Object} returns.publicApi - Public API exports (PostLike model, PostLikesService)
 */
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
