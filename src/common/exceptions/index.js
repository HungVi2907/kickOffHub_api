/**
 * =============================================================================
 * FILE: src/common/exceptions/index.js
 * =============================================================================
 * 
 * @fileoverview Exception Classes Re-export Module
 * 
 * @description
 * Barrel file để export tất cả exception classes.
 * Cho phép import multiple exceptions từ một location.
 * 
 * ## Available Exceptions:
 * 
 * | Exception           | Status | Use Case                          |
 * |---------------------|--------|-----------------------------------|
 * | AppException        | 500    | Base exception, generic errors    |
 * | ValidationException | 400    | Input validation errors           |
 * | AuthException       | 401    | Authentication errors             |
 * | ForbiddenException  | 403    | Authorization errors              |
 * | NotFoundException   | 404    | Resource not found                |
 * | ConflictException   | 409    | Duplicate/conflict errors         |
 * 
 * @module common/exceptions
 * 
 * @example
 * import {
 *   AppException,
 *   ValidationException,
 *   AuthException,
 *   NotFoundException,
 *   ConflictException,
 *   ForbiddenException
 * } from './common/exceptions/index.js';
 * 
 * // Hoặc import single exception
 * import { NotFoundException } from './common/exceptions/index.js';
 * 
 * =============================================================================
 */

export { default as AppException } from './AppException.js';
export { default as ValidationException } from './ValidationException.js';
export { default as AuthException } from './AuthException.js';
export { default as NotFoundException } from './NotFoundException.js';
export { default as ConflictException } from './ConflictException.js';
export { default as ForbiddenException } from './ForbiddenException.js';
