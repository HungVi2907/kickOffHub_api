/**
 * @fileoverview Comments Module Entry Point
 * @module modules/comments
 * @description Module đăng ký cho chức năng bình luận (comments).
 *              Cung cấp khả năng tạo và xóa bình luận trên các bài viết.
 *
 * @requires ./routes/comments.routes.js - Route definitions cho comments API
 * @requires ./models/comment.model.js - Sequelize model cho Comment entity
 * @requires ./services/comments.service.js - Business logic xử lý comments
 * @requires ../../contracts/tokens.js - Dependency injection tokens
 *
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { privateRouter } from './routes/comments.routes.js';
import Comment from './models/comment.model.js';
import * as CommentsService from './services/comments.service.js';
import { TOKENS } from '../../contracts/tokens.js';

/**
 * Đăng ký Comments Module vào container dependency injection.
 * Thiết lập các dependencies và trả về cấu hình module.
 *
 * @async
 * @function registerCommentsModule
 * @param {Object} options - Options object
 * @param {Object} options.container - Dependency injection container
 * @returns {Promise<Object>} Module configuration object
 * @returns {string} returns.name - Tên module ('comments')
 * @returns {string} returns.basePath - Base path cho routes ('/')
 * @returns {Router} returns.privateRoutes - Express router cho authenticated routes
 * @returns {Object} returns.publicApi - Public API exports của module
 *
 * @example
 * // Đăng ký module trong application bootstrap
 * const commentsModule = await registerCommentsModule({ container });
 * app.use(commentsModule.basePath, commentsModule.privateRoutes);
 */
export default async function registerCommentsModule({ container }) {
  // Đăng ký Comment model vào container
  container.set(TOKENS.models.Comment, Comment);

  // Đăng ký Comments service vào container
  container.set(TOKENS.services.comments, CommentsService);

  return {
    name: 'comments',
    basePath: '/',
    privateRoutes: privateRouter,
    publicApi: {
      Comment,
      services: CommentsService,
    },
  };
}
