import { AppException } from './exceptions/index.js';

export function toAppException(err, fallbackMessage = 'Request failed', fallbackCode = 'INTERNAL_ERROR', fallbackStatus = 500) {
  if (err instanceof AppException) {
    return err;
  }

  const status = err?.statusCode || err?.status || fallbackStatus;
  const code = err?.code || fallbackCode;
  const message = err?.message || fallbackMessage;
  const metadata = err?.metadata || err?.details;

  return new AppException(message, code, status, metadata);
}

export default toAppException;
