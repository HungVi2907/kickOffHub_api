export default class AppException extends Error {
  constructor(message = 'Application error', code = 'APP_ERROR', status = 500, metadata = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.statusCode = status;
    this.metadata = metadata;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
