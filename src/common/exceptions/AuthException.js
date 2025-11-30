import AppException from './AppException.js';

export default class AuthException extends AppException {
  constructor(message = 'Unauthorized', code = 'AUTH_ERROR', status = 401, metadata) {
    super(message, code, status, metadata);
  }
}
