import AppException from './AppException.js';

export default class ConflictException extends AppException {
  constructor(message = 'Conflict', code = 'CONFLICT', metadata) {
    super(message, code, 409, metadata);
  }
}
