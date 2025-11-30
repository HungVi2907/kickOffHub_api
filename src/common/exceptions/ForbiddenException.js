import AppException from './AppException.js';

export default class ForbiddenException extends AppException {
  constructor(message = 'Forbidden', code = 'FORBIDDEN', metadata) {
    super(message, code, 403, metadata);
  }
}
