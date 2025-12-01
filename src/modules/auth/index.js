/**
 * =============================================================================
 * FILE: src/modules/auth/index.js
 * =============================================================================
 * 
 * @fileoverview Authentication Module Registration
 * 
 * @description
 * Module đăng ký cho Authentication feature.
 * Xử lý user registration, login, và JWT token management.
 * 
 * ## Module Structure:
 * - controllers/: HTTP request handlers
 * - services/: Business logic (register, login)
 * - routes/: Express route definitions
 * - validation/: Zod schemas cho input validation
 * 
 * ## Endpoints:
 * | Method | Path           | Description          |
 * |--------|----------------|----------------------|
 * | POST   | /auth/register | User registration    |
 * | POST   | /auth/login    | User authentication  |
 * 
 * ## Dependencies:
 * - users module: User repository functions
 * - config/auth: JWT configuration
 * 
 * @module modules/auth
 * @requires contracts/tokens
 * 
 * =============================================================================
 */

import router from './routes/auth.routes.js';
import * as AuthService from './services/auth.service.js';
import { TOKENS } from '../../contracts/tokens.js';

// =============================================================================
// Module Registration
// =============================================================================

/**
 * Đăng ký Auth module vào DI container.
 * 
 * @async
 * @function registerAuthModule
 * @param {Object} params - Module registration parameters
 * @param {Map} params.container - DI container
 * @returns {Promise<Object>} Module metadata
 * @property {string} name - Tên module ('auth')
 * @property {string} basePath - Base path cho routes ('/')
 * @property {Router} routes - Express router instance
 * @property {Object} publicApi - Public exports của module
 */
export default async function registerAuthModule({ container }) {
  // Đăng ký AuthService vào container
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
