/**
 * =============================================================================
 * FILE: src/modules/auth/controllers/auth.controller.js
 * =============================================================================
 * 
 * @fileoverview Authentication HTTP Controller
 * 
 * @description
 * Controller xử lý HTTP requests cho authentication endpoints.
 * Điều hướng requests tới AuthService và format responses.
 * 
 * ## Endpoints handled:
 * - POST /auth/register: User registration
 * - POST /auth/login: User authentication
 * 
 * ## Response Format:
 * Success: { success: true, message: '...', data: {...} }
 * Error: Chuyển tới error handler middleware
 * 
 * @module modules/auth/controllers/auth.controller
 * @requires common/response
 * @requires common/controllerError
 * @requires modules/auth/services/auth.service
 * 
 * =============================================================================
 */

import ApiResponse from '../../../common/response.js';
import toAppException from '../../../common/controllerError.js';
import { loginUser, registerUser } from '../services/auth.service.js';

// =============================================================================
// Controller Class
// =============================================================================

/**
 * Authentication Controller.
 * Xử lý các HTTP requests liên quan đến authentication.
 * 
 * @class AuthController
 */
class AuthController {
  /**
   * Xử lý user registration.
   * 
   * @static
   * @async
   * @param {import('express').Request} req - Express request với registration data trong body
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Next middleware function
   * @returns {Promise<void>}
   * 
   * @description
   * Request body: { name, email, password }
   * Response: 201 Created với { token, user }
   */
  static async register(req, res, next) {
    try {
      const result = await registerUser(req.body);
      return ApiResponse.created(res, result, 'Đăng ký thành công');
    } catch (err) {
      next(toAppException(err, 'Đăng ký thất bại', 'AUTH_REGISTER_FAILED'));
    }
  }

  /**
   * Xử lý user login.
   * 
   * @static
   * @async
   * @param {import('express').Request} req - Express request với login credentials trong body
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Next middleware function
   * @returns {Promise<void>}
   * 
   * @description
   * Request body: { email, password }
   * Response: 200 OK với { token, user }
   */
  static async login(req, res, next) {
    try {
      const result = await loginUser(req.body);
      return ApiResponse.success(res, result, 'Đăng nhập thành công');
    } catch (err) {
      next(toAppException(err, 'Đăng nhập thất bại', 'AUTH_LOGIN_FAILED'));
    }
  }
}

export default AuthController;
