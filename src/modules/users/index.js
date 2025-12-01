/**
 * =============================================================================
 * FILE: src/modules/users/index.js
 * =============================================================================
 * 
 * @fileoverview Users Module Registration
 * 
 * @description
 * Module đăng ký cho Users feature.
 * Xử lý user CRUD operations và profile management.
 * 
 * ## Module Structure:
 * - models/: Sequelize User model
 * - repositories/: Data access layer
 * - services/: Business logic
 * - controllers/: HTTP request handlers
 * - routes/: Express route definitions
 * - validation/: Zod schemas
 * 
 * ## Endpoints:
 * | Method | Path          | Description       | Auth |
 * |--------|---------------|-------------------|------|
 * | GET    | /profile      | Get current user  | Yes  |
 * | GET    | /users        | List all users    | No   |
 * | GET    | /users/:id    | Get user by ID    | No   |
 * | POST   | /users        | Create user       | No   |
 * | PUT    | /users/:id    | Update user       | No   |
 * | DELETE | /users/:id    | Delete user       | No   |
 * 
 * @module modules/users
 * @requires contracts/tokens
 * 
 * =============================================================================
 */

import router from './routes/users.routes.js';
import User from './models/user.model.js';
import * as UsersService from './services/users.service.js';
import { TOKENS, registerIfMissing } from '../../contracts/tokens.js';

// =============================================================================
// Module Registration
// =============================================================================

/**
 * Đăng ký Users module vào DI container.
 * 
 * @async
 * @function registerUsersModule
 * @param {Object} params - Module registration parameters
 * @param {Map} params.container - DI container
 * @returns {Promise<Object>} Module metadata
 * @property {string} name - Tên module ('users')
 * @property {string} basePath - Base path cho routes ('/')
 * @property {Router} routes - Express router instance
 * @property {Object} publicApi - Public exports: User model và services
 */
export default async function registerUsersModule({ container }) {
  // Đăng ký User model và service vào container
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
