import { logger } from './logger.js';

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const isProduction = process.env.NODE_ENV === 'production';

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled application error');

  const errorPayload = {
    message: err.message || 'An unexpected error occurred',
    code,
    status: statusCode,
  };

  if (err.metadata) {
    errorPayload.details = err.metadata;
  }

  if (!isProduction && err.stack) {
    errorPayload.stack = err.stack;
  }

  res.status(statusCode).json({
    success: false,
    error: errorPayload,
  });
}

export default errorHandler;
