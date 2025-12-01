/**
 * @file Tags Module Entry Point
 * @description Registers the tags module with its model, service, and routes.
 * Provides tag management functionality for forum posts.
 * @module modules/tags
 */

import router from './routes/tags.routes.js';
import Tag from './models/tag.model.js';
import * as TagsService from './services/tags.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

/**
 * Registers the tags module with the application container.
 * @async
 * @function registerTagsModule
 * @param {Object} params - Registration parameters
 * @param {Object} params.container - Dependency injection container
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - Module name ('tags')
 * @returns {string} returns.basePath - Base path for routes
 * @returns {Object} returns.routes - Express router instance
 * @returns {Object} returns.publicApi - Public API exports (Tag model, TagsService)
 */
export default async function registerTagsModule({ container }) {
  registerIfMissing(container, TOKENS.models.Tag, Tag);
  container.set(TOKENS.services.tags, TagsService);

  return {
    name: 'tags',
    basePath: '/',
    routes: router,
    publicApi: {
      Tag,
      services: TagsService,
    },
  };
}
