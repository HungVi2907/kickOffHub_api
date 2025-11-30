import { validationResult } from 'express-validator';
import ValidationException from '../common/exceptions/ValidationException.js';

export default function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
    return;
  }

  next(
    new ValidationException('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', {
      issues: errors.array().map((item) => ({ field: item.param, message: item.msg })),
    })
  );
}
