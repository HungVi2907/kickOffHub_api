import ApiResponse from '../../../common/response.js';
import toAppException from '../../../common/controllerError.js';
import {
  createUserRecord,
  getUserById,
  listUsers,
  removeUser,
  updateUserRecord,
} from '../services/users.service.js';

class UsersController {
  static async list(_req, res, next) {
    try {
      const users = await listUsers();
      return ApiResponse.success(res, users, 'Users retrieved');
    } catch (err) {
      next(toAppException(err, 'Failed to list users', 'USERS_LIST_FAILED'));
    }
  }

  static async detail(req, res, next) {
    try {
      const user = await getUserById(req.params.id);
      return ApiResponse.success(res, user, 'User retrieved');
    } catch (err) {
      next(toAppException(err, 'Failed to retrieve user', 'USER_FETCH_FAILED'));
    }
  }

  static async create(req, res, next) {
    try {
      const user = await createUserRecord(req.body);
      return ApiResponse.created(res, user, 'User created');
    } catch (err) {
      next(toAppException(err, 'Failed to create user', 'USER_CREATE_FAILED'));
    }
  }

  static async update(req, res, next) {
    try {
      const user = await updateUserRecord(req.params.id, req.body);
      return ApiResponse.success(res, user, 'User updated');
    } catch (err) {
      next(toAppException(err, 'Failed to update user', 'USER_UPDATE_FAILED'));
    }
  }

  static async remove(req, res, next) {
    try {
      await removeUser(req.params.id);
      return ApiResponse.success(res, { id: Number.parseInt(req.params.id, 10) || req.params.id }, 'User deleted');
    } catch (err) {
      next(toAppException(err, 'Failed to delete user', 'USER_DELETE_FAILED'));
    }
  }

  static profile(req, res) {
    return ApiResponse.success(res, { user: req.user }, 'Profile retrieved');
  }
}

export default UsersController;
