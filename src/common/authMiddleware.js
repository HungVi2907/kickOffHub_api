/**
 * =============================================================================
 * FILE: src/common/authMiddleware.js
 * =============================================================================
 * 
 * @fileoverview JWT Authentication Middleware
 * 
 * @description
 * File này cung cấp middleware xác thực JWT token cho các protected routes.
 * 
 * ## Authentication Flow:
 * ```
 * Request → authMiddleware → Controller
 *    ↓
 *    1. Extract token từ Authorization header
 *    2. Verify JWT signature và expiration
 *    3. Lookup user từ database
 *    4. Attach user object vào req.user
 *    ↓
 * Nếu thất bại → AuthException → Error Handler
 * ```
 * 
 * ## Cách sử dụng:
 * ```javascript
 * import auth from './common/authMiddleware.js';
 * 
 * // Protected route
 * router.get('/profile', auth, (req, res) => {
 *   const user = req.user;  // User đã được authenticate
 * });
 * ```
 * 
 * ## Header Format:
 * ```
 * Authorization: Bearer <jwt_token>
 * ```
 * 
 * @module common/authMiddleware
 * @requires jsonwebtoken
 * @requires ../modules/users/models/user.model.js
 * @requires ../config/auth.js
 * @requires ./exceptions/AuthException.js
 * 
 * =============================================================================
 */

import jwt from 'jsonwebtoken';
import User from '../modules/users/models/user.model.js';
import { JWT_SECRET } from '../config/auth.js';
import AuthException from './exceptions/AuthException.js';

/**
 * JWT Authentication Middleware
 * 
 * @async
 * @function authMiddleware
 * @description
 * Middleware xác thực Bearer token trong Authorization header.
 * 
 * ## Các bước xử lý:
 * 1. Kiểm tra Authorization header có tồn tại và đúng format
 * 2. Extract và verify JWT token
 * 3. Tìm user trong database theo decoded user ID
 * 4. Attach user object vào request
 * 
 * ## Error Codes:
 * | Code               | Description                        | HTTP Status |
 * |--------------------|------------------------------------|-------------|
 * | AUTH_TOKEN_MISSING | Không có Authorization header      | 401         |
 * | AUTH_INVALID_TOKEN | Token không hợp lệ hoặc user không tồn tại | 401  |
 * | AUTH_TOKEN_EXPIRED | Token đã hết hạn                   | 401         |
 * 
 * @param {Request} req - Express request object
 * @param {Response} _res - Express response object (không sử dụng)
 * @param {Function} next - Next middleware function
 * @returns {Promise<void>}
 * 
 * @throws {AuthException} Nếu authentication thất bại
 * 
 * @example
 * // Trong route definition
 * router.get('/profile', authMiddleware, ProfileController.get);
 * 
 * // Trong controller, access user
 * const userId = req.user.id;
 */
export default async function authMiddleware(req, _res, next) {
  // =========================================================================
  // BƯỚC 1: Kiểm tra Authorization header
  // =========================================================================
  const authHeader = req.headers.authorization;
  
  // Header phải tồn tại và có format "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthException('Không có token', 'AUTH_TOKEN_MISSING'));
  }

  // =========================================================================
  // BƯỚC 2: Extract và verify token
  // =========================================================================
  // Tách token từ header (bỏ prefix "Bearer ")
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token với secret key
    // jwt.verify sẽ throw error nếu:
    // - Token signature không hợp lệ
    // - Token đã expired
    // - Token malformed
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // =========================================================================
    // BƯỚC 3: Lookup user từ database
    // =========================================================================
    // Tìm user theo ID được encode trong token
    const user = await User.findByPk(decoded.id);
    
    // User phải tồn tại (có thể đã bị xóa sau khi token được cấp)
    if (!user) {
      throw new AuthException('Token không hợp lệ', 'AUTH_INVALID_TOKEN');
    }
    
    // =========================================================================
    // BƯỚC 4: Attach user vào request
    // =========================================================================
    // Controllers sau đó có thể access req.user
    req.user = user;
    
    // Tiếp tục với route handler
    next();
  } catch (err) {
    // Nếu đã là AuthException, pass qua
    // Nếu là JWT error (expired, invalid), wrap thành AuthException
    next(
      err instanceof AuthException
        ? err
        : new AuthException('Token không hợp lệ hoặc hết hạn', 'AUTH_TOKEN_EXPIRED')
    );
  }
}
