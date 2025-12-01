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
 * import auth, { optionalAuth } from './common/authMiddleware.js';
 * 
 * // Protected route (yêu cầu authentication)
 * router.get('/profile', auth, (req, res) => {
 *   const user = req.user;  // User đã được authenticate
 * });
 * 
 * // Public route với optional user context
 * router.get('/posts/:id', optionalAuth, (req, res) => {
 *   const user = req.user;  // User nếu có token, undefined nếu không
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

/**
 * Optional JWT Authentication Middleware
 * 
 * @async
 * @function optionalAuth
 * @description
 * Middleware xác thực Bearer token nếu có, nhưng không yêu cầu bắt buộc.
 * Hữu ích cho public routes cần biết user đang đăng nhập (nếu có).
 * 
 * ## Khác biệt với authMiddleware:
 * - authMiddleware: Yêu cầu token, throw error nếu không có
 * - optionalAuth: Không yêu cầu token, chỉ attach user nếu token hợp lệ
 * 
 * ## Use cases:
 * - Post detail: Hiển thị isLikedByCurrentUser nếu user đăng nhập
 * - Comments: Hiển thị nút edit/delete cho owner
 * 
 * @param {Request} req - Express request object
 * @param {Response} _res - Express response object (không sử dụng)
 * @param {Function} next - Next middleware function
 * @returns {Promise<void>}
 * 
 * @example
 * import { optionalAuth } from './common/authMiddleware.js';
 * 
 * // Public route với optional user context
 * router.get('/posts/:id', optionalAuth, (req, res) => {
 *   if (req.user) {
 *     // User đã đăng nhập
 *   } else {
 *     // Guest user
 *   }
 * });
 */
export async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  
  // Không có header hoặc sai format → tiếp tục mà không có user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    // Attach user nếu tìm thấy, null nếu không
    req.user = user || null;
  } catch {
    // Token không hợp lệ → tiếp tục như guest
    req.user = null;
  }
  
  next();
}
