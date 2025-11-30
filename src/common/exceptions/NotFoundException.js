import AppException from './AppException.js';

export default class NotFoundException extends AppException {
  constructor(message = 'Resource not found', code = 'NOT_FOUND', metadata) {
    super(message, code, 404, metadata);
  }
}
