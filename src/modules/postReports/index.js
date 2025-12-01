/**
 * @file Post Reports Module Entry Point
 * @description Registers the post reports module with its model, service, and routes.
 * Provides functionality for users to report inappropriate forum posts.
 * @module modules/postReports
 */

import router from './routes/postReports.routes.js';
import PostReport from './models/postReport.model.js';
import * as PostReportsService from './services/postReports.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

/**
 * Registers the post reports module with the application container.
 * @async
 * @function registerPostReportsModule
 * @param {Object} params - Registration parameters
 * @param {Object} params.container - Dependency injection container
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - Module name ('postReports')
 * @returns {string} returns.basePath - Base path for routes
 * @returns {Object} returns.routes - Express router instance
 * @returns {Object} returns.publicApi - Public API exports (PostReport model, PostReportsService)
 */
export default async function registerPostReportsModule({ container }) {
  registerIfMissing(container, TOKENS.models.PostReport, PostReport);
  container.set(TOKENS.services.postReports, PostReportsService);

  return {
    name: 'postReports',
    basePath: '/',
    routes: router,
    publicApi: {
      PostReport,
      services: PostReportsService,
    },
  };
}
