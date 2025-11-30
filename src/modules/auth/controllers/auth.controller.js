import ApiResponse from '../../../common/response.js';
import toAppException from '../../../common/controllerError.js';
import { loginUser, registerUser } from '../services/auth.service.js';

class AuthController {
  static async register(req, res, next) {
    try {
      const result = await registerUser(req.body);
      return ApiResponse.created(res, result, 'Đăng ký thành công');
    } catch (err) {
      next(toAppException(err, 'Đăng ký thất bại', 'AUTH_REGISTER_FAILED'));
    }
  }

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
