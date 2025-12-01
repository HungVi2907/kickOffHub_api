/**
 * =============================================================================
 * FILE: src/middlewares/validateRequest.js
 * =============================================================================
 * 
 * @fileoverview Express-Validator Request Validation Middleware
 * 
 * @description
 * Middleware để validate request sử dụng express-validator.
 * Chuyển đổi validation errors thành ValidationException.
 * 
 * ## Usage với express-validator:
 * ```javascript
 * import { body, param } from 'express-validator';
 * import validateRequest from './middlewares/validateRequest.js';
 * 
 * router.post('/users',
 *   body('email').isEmail(),
 *   body('password').isLength({ min: 6 }),
 *   validateRequest, // Phải đặt SAU các validation rules
 *   createUser
 * );
 * ```
 * 
 * ## Error Response Format:
 * ```json
 * {
 *   "success": false,
 *   "message": "Dữ liệu không hợp lệ",
 *   "code": "VALIDATION_ERROR",
 *   "data": {
 *     "issues": [
 *       { "field": "email", "message": "Invalid value" }
 *     ]
 *   }
 * }
 * ```
 * 
 * @module middlewares/validateRequest
 * @requires express-validator
 * @requires common/exceptions/ValidationException
 * @exports {Function} default - Validation result checker middleware
 * 
 * =============================================================================
 */

import { validationResult } from 'express-validator';
import ValidationException from '../common/exceptions/ValidationException.js';

// =============================================================================
// Middleware
// =============================================================================

/**
 * Middleware kiểm tra kết quả validation từ express-validator.
 * 
 * @function validateRequest
 * @param {import('express').Request} req - Express request đã qua validation chain
 * @param {import('express').Response} _res - Express response (không sử dụng)
 * @param {import('express').NextFunction} next - Next middleware function
 * @throws {ValidationException} 400 nếu có validation errors
 * 
 * @description
 * Workflow:
 * 1. Thu thập validation errors từ express-validator
 * 2. Nếu không có errors: continue
 * 3. Nếu có errors: throw ValidationException với formatted issues
 */
export default function validateRequest(req, _res, next) {
  // Thu thập validation errors từ request
  const errors = validationResult(req);
  
  // Nếu không có lỗi, continue
  if (errors.isEmpty()) {
    next();
    return;
  }

  // Throw ValidationException với formatted errors
  next(
    new ValidationException('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', {
      issues: errors.array().map((item) => ({ 
        field: item.param,   // Field name
        message: item.msg    // Error message
      })),
    })
  );
}
