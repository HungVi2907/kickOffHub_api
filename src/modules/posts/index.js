/**
 * @fileoverview Posts Module Entry Point - Điểm vào chính của module Posts
 * 
 * Module này quản lý tất cả chức năng liên quan đến bài viết trong hệ thống KickOffHub,
 * bao gồm CRUD operations, upload hình ảnh, và quản lý tags.
 * 
 * @module modules/posts
 * @requires ./routes/posts.routes.js - Public và private routers
 * @requires ./models/post.model.js - Sequelize Post model
 * @requires ./models/postTag.model.js - Sequelize PostTag junction model
 * @requires ./services/posts.service.js - Business logic layer
 * @requires ../../contracts/tokens.js - Dependency injection tokens
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { publicRouter, privateRouter } from './routes/posts.routes.js';
import Post from './models/post.model.js';
import './models/postTag.model.js';
import * as PostsService from './services/posts.service.js';
import { TOKENS } from '../../contracts/tokens.js';

/**
 * Đăng ký module Posts vào dependency injection container
 * 
 * Hàm này thực hiện:
 * 1. Đăng ký Post model vào container (nếu chưa có)
 * 2. Đăng ký PostsService vào container
 * 3. Trả về cấu hình module bao gồm routes và public API
 * 
 * @async
 * @function registerPostsModule
 * @param {Object} options - Tham số khởi tạo module
 * @param {Object} options.container - Dependency injection container instance
 * @returns {Promise<Object>} Cấu hình module đã đăng ký
 * @returns {string} returns.name - Tên module ('posts')
 * @returns {string} returns.basePath - Base path cho routes ('/')
 * @returns {express.Router} returns.publicRoutes - Router cho các endpoint công khai
 * @returns {express.Router} returns.privateRoutes - Router cho các endpoint yêu cầu xác thực
 * @returns {Object} returns.publicApi - API công khai để các module khác sử dụng
 * @returns {Object} returns.publicApi.Post - Sequelize Post model
 * @returns {Object} returns.publicApi.services - PostsService instance
 * 
 * @example
 * // Đăng ký module trong bootstrap
 * const postsModule = await registerPostsModule({ container: appContainer });
 * app.use(postsModule.basePath, postsModule.publicRoutes);
 */
export default async function registerPostsModule({ container }) {
  // Kiểm tra và đăng ký Post model vào container (tránh đăng ký trùng lặp)
  if (!container.has(TOKENS.models.Post)) {
    container.set(TOKENS.models.Post, Post);
  }

  // Đăng ký PostsService vào container
  container.set(TOKENS.services.posts, PostsService);

  // Trả về cấu hình module để bootstrap có thể mount routes
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
