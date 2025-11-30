import jwt from 'jsonwebtoken';
import User from '../modules/users/models/user.model.js';
import { JWT_SECRET } from '../config/auth.js';
import AuthException from './exceptions/AuthException.js';

export default async function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthException('Không có token', 'AUTH_TOKEN_MISSING'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new AuthException('Token không hợp lệ', 'AUTH_INVALID_TOKEN');
    }
    req.user = user;
    next();
  } catch (err) {
    next(
      err instanceof AuthException
        ? err
        : new AuthException('Token không hợp lệ hoặc hết hạn', 'AUTH_TOKEN_EXPIRED')
    );
  }
}
