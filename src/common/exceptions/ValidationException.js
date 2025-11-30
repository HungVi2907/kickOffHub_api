import AppException from './AppException.js';

export default class ValidationException extends AppException {
  constructor(message = 'Validation failed', code = 'VALIDATION_ERROR', metadata) {
    super(message, code, 400, metadata);
  }
}
