/**
 * =============================================================================
 * FILE: src/common/controllerError.js
 * =============================================================================
 * 
 * @fileoverview Controller Error Helper
 * 
 * @description
 * File này cung cấp helper function để convert errors thành AppException.
 * Sử dụng trong controllers để normalize errors trước khi pass tới error handler.
 * 
 * ## Mục đích:
 * - Convert generic errors thành AppException format
 * - Preserve existing AppException instances
 * - Provide fallback values cho errors không có đủ thông tin
 * 
 * @module common/controllerError
 * @requires ./exceptions/index.js
 * 
 * @example
 * import toAppException from './common/controllerError.js';
 * 
 * async function controller(req, res, next) {
 *   try {
 *     // ... logic
 *   } catch (err) {
 *     next(toAppException(err, 'Operation failed', 'OP_FAILED'));
 *   }
 * }
 * 
 * =============================================================================
 */

import { AppException } from './exceptions/index.js';

/**
 * Convert error thành AppException
 * 
 * @function toAppException
 * @description
 * Normalize error thành AppException format.
 * Nếu error đã là AppException, trả về nguyên vẹn.
 * Nếu không, tạo AppException mới với fallback values.
 * 
 * ## Logic xử lý:
 * 1. Nếu đã là AppException → return ngay
 * 2. Extract thông tin từ error (status, code, message)
 * 3. Sử dụng fallback values nếu không có
 * 4. Preserve metadata/details nếu có
 * 
 * @param {Error} err - Original error
 * @param {string} [fallbackMessage='Request failed'] - Message mặc định
 * @param {string} [fallbackCode='INTERNAL_ERROR'] - Error code mặc định
 * @param {number} [fallbackStatus=500] - HTTP status mặc định
 * @returns {AppException} Normalized AppException
 * 
 * @example
 * // Generic Error → AppException
 * const err = new Error('Something went wrong');
 * const appErr = toAppException(err, 'Operation failed', 'OP_FAILED', 400);
 * // Result: AppException { message: 'Something went wrong', code: 'OP_FAILED', status: 400 }
 * 
 * // AppException → Same AppException
 * const existing = new AppException('Not found', 'NOT_FOUND', 404);
 * const result = toAppException(existing);
 * // Result: existing (unchanged)
 */
export function toAppException(err, fallbackMessage = 'Request failed', fallbackCode = 'INTERNAL_ERROR', fallbackStatus = 500) {
  // Nếu đã là AppException, không cần convert
  if (err instanceof AppException) {
    return err;
  }

  // Extract thông tin từ error object
  // Một số libraries sử dụng statusCode, một số sử dụng status
  const status = err?.statusCode || err?.status || fallbackStatus;
  
  // Error code cho client-side handling
  const code = err?.code || fallbackCode;
  
  // Human-readable message
  const message = err?.message || fallbackMessage;
  
  // Additional metadata (validation details, etc.)
  const metadata = err?.metadata || err?.details;

  // Tạo AppException mới với extracted/fallback values
  return new AppException(message, code, status, metadata);
}

export default toAppException;
