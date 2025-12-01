/**
 * =============================================================================
 * FILE: src/middlewares/validateSchema.js
 * =============================================================================
 * 
 * @fileoverview Zod Schema Validation Middleware
 * 
 * @description
 * Middleware factory để validate request sử dụng Zod schemas.
 * Parse và validate body, query, params cùng lúc.
 * 
 * ## Ưu điểm so với express-validator:
 * - Type-safe với TypeScript
 * - Schema composition và reuse
 * - Coercion tự động (string → number, etc.)
 * - Better error messages
 * 
 * ## Usage:
 * ```javascript
 * import { z } from 'zod';
 * import { validateSchema } from './middlewares/validateSchema.js';
 * 
 * const createPostSchema = z.object({
 *   body: z.object({
 *     title: z.string().min(1),
 *     content: z.string().optional()
 *   }),
 *   params: z.object({
 *     teamId: z.coerce.number()
 *   })
 * });
 * 
 * router.post('/teams/:teamId/posts',
 *   validateSchema(createPostSchema),
 *   createPost
 * );
 * ```
 * 
 * ## Features:
 * - Parse body, query, params đồng thời
 * - Tự động update req.body/query/params với parsed values
 * - Coercion types theo schema
 * - Throw ValidationException với Zod errors
 * 
 * @module middlewares/validateSchema
 * @requires zod
 * @requires common/exceptions/ValidationException
 * @exports {Function} validateSchema - Factory tạo validation middleware
 * 
 * =============================================================================
 */

import { ZodError } from 'zod';
import ValidationException from '../common/exceptions/ValidationException.js';

// =============================================================================
// Middleware Factory
// =============================================================================

/**
 * Factory function tạo Zod validation middleware.
 * 
 * @function validateSchema
 * @param {import('zod').ZodSchema} schema - Zod schema để validate
 * @returns {import('express').RequestHandler} Express middleware function
 * @throws {ValidationException} 400 nếu validation fails
 * 
 * @description
 * Workflow:
 * 1. Parse request { body, query, params } với Zod schema
 * 2. Update req.body/query/params với parsed (coerced) values
 * 3. Nếu ZodError: throw ValidationException với formatted issues
 * 4. Nếu other error: throw generic ValidationException
 * 
 * @example
 * // Schema định nghĩa
 * const schema = z.object({
 *   body: z.object({
 *     email: z.string().email(),
 *     age: z.number().min(18)
 *   }),
 *   query: z.object({
 *     page: z.coerce.number().default(1)
 *   }).optional()
 * });
 * 
 * // Sử dụng
 * router.post('/users', validateSchema(schema), handler);
 */
export function validateSchema(schema) {
  return (req, _res, next) => {
    try {
      // Parse và validate tất cả parts của request
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update request với parsed/coerced values
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
      // Xử lý Zod validation errors
      if (err instanceof ZodError) {
        return next(
          new ValidationException('Validation failed', 'VALIDATION_ERROR', { 
            issues: err.errors // Zod error format
          })
        );
      }

      // Xử lý các errors khác
      next(new ValidationException(err.message || 'Validation failed'));
    }
  };
}
