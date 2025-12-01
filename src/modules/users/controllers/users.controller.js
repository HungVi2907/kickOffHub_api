/**
 * =============================================================================
 * FILE: src/modules/users/controllers/users.controller.js
 * =============================================================================
 * 
 * @fileoverview Users HTTP Controller
 * 
 * @description
 * Controller xử lý HTTP requests cho Users endpoints.
 * CRUD operations và profile retrieval.
 * 
 * ## Endpoints handled:
 * - GET /users: List all users
 * - GET /users/:id: Get user by ID
 * - POST /users: Create user
 * - PUT /users/:id: Update user
 * - DELETE /users/:id: Delete user
 * - GET /profile: Get authenticated user profile
 * 
 * @module modules/users/controllers/users.controller
 * @requires common/response
 * @requires common/controllerError
 * @requires modules/users/services/users.service
 * 
 * =============================================================================
 */

import ApiResponse from '../../../common/response.js';
import toAppException from '../../../common/controllerError.js';
import {
  createUserRecord,
  getUserById,
  listUsers,
  removeUser,
  updateUserRecord,
} from '../services/users.service.js';

// =============================================================================
// Controller Class
// =============================================================================

/**
 * Users Controller.
 * Xử lý các HTTP requests liên quan đến Users.
 * 
 * @class UsersController
 */
class UsersController {
  /**
   * Lấy danh sách tất cả users.
   * 
   * @static
   * @async
   * @param {import('express').Request} _req - Express request (không sử dụng)
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Next middleware function
   * @returns {Promise<void>}
   */
  static async list(_req, res, next) {
    try {
      const users = await listUsers();
      return ApiResponse.success(res, users, 'Users retrieved');
    } catch (err) {
      next(toAppException(err, 'Failed to list users', 'USERS_LIST_FAILED'));
    }
  }

  /**
   * Lấy chi tiết user theo ID.
   * 
   * @static
   * @async
   * @param {import('express').Request} req - Express request với params.id
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Next middleware function
   * @returns {Promise<void>}
   */
  static async detail(req, res, next) {
    try {
      const user = await getUserById(req.params.id);
      return ApiResponse.success(res, user, 'User retrieved');
    } catch (err) {
      next(toAppException(err, 'Failed to retrieve user', 'USER_FETCH_FAILED'));
    }
  }

  /**
   * Tạo user mới.
   * 
   * @static
   * @async
   * @param {import('express').Request} req - Express request với body data
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Next middleware function
   * @returns {Promise<void>}
   */
  static async create(req, res, next) {
    try {
      const user = await createUserRecord(req.body);
      return ApiResponse.created(res, user, 'User created');
    } catch (err) {
      next(toAppException(err, 'Failed to create user', 'USER_CREATE_FAILED'));
    }
  }

  /**
   * Cập nhật user theo ID.
   * 
   * @static
   * @async
   * @param {import('express').Request} req - Express request với params.id và body
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Next middleware function
   * @returns {Promise<void>}
   */
  static async update(req, res, next) {
    try {
      const user = await updateUserRecord(req.params.id, req.body);
      return ApiResponse.success(res, user, 'User updated');
    } catch (err) {
      next(toAppException(err, 'Failed to update user', 'USER_UPDATE_FAILED'));
    }
  }

  /**
   * Xóa user theo ID.
   * 
   * @static
   * @async
   * @param {import('express').Request} req - Express request với params.id
   * @param {import('express').Response} res - Express response
   * @param {import('express').NextFunction} next - Next middleware function
   * @returns {Promise<void>}
   */
  static async remove(req, res, next) {
    try {
      await removeUser(req.params.id);
      return ApiResponse.success(res, { id: Number.parseInt(req.params.id, 10) || req.params.id }, 'User deleted');
    } catch (err) {
      next(toAppException(err, 'Failed to delete user', 'USER_DELETE_FAILED'));
    }
  }

  /**
   * Lấy profile của authenticated user.
   * Trả về JWT payload từ auth middleware.
   * 
   * @static
   * @param {import('express').Request} req - Express request với req.user
   * @param {import('express').Response} res - Express response
   * @returns {Object} JSON response với user profile
   */
  static profile(req, res) {
    return ApiResponse.success(res, { user: req.user }, 'Profile retrieved');
  }
}

export default UsersController;
