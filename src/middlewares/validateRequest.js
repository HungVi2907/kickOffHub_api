import { validationResult } from 'express-validator';

export default function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
    return;
  }

  res.status(400).json({
    error: 'Dữ liệu không hợp lệ',
    details: errors.array().map((item) => ({ field: item.param, message: item.msg }))
  });
}
