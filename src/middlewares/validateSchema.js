import { ZodError } from 'zod';
import ValidationException from '../common/exceptions/ValidationException.js';

export function validateSchema(schema) {
  return (req, _res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (result.body) {
        req.body = result.body;
      }
      if (result.query) {
        req.query = result.query;
      }
      if (result.params) {
        req.params = result.params;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new ValidationException('Validation failed', 'VALIDATION_ERROR', { issues: err.errors })
        );
      }

      next(new ValidationException(err.message || 'Validation failed'));
    }
  };
}
