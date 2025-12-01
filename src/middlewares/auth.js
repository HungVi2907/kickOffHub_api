/**
 * =============================================================================
 * FILE: src/middlewares/auth.js
 * =============================================================================
 * 
 * @fileoverview Authentication Middleware Re-export
 * 
 * @description
 * Re-export authentication middleware từ common folder.
 * Đây là facade để dễ import từ middlewares directory.
 * 
 * @module middlewares/auth
 * @see module:common/authMiddleware
 * @exports {Function} default - JWT authentication middleware
 * 
 * @example
 * import authMiddleware from './middlewares/auth.js';
 * 
 * router.use(authMiddleware);
 * router.get('/protected', (req, res) => {
 *   console.log(req.user); // JWT payload
 * });
 * 
 * =============================================================================
 */

export { default } from '../common/authMiddleware.js';