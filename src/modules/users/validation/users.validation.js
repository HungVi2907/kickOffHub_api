/**
 * =============================================================================
 * FILE: src/modules/users/validation/users.validation.js
 * =============================================================================
 * 
 * @fileoverview Users Zod Validation Schemas
 * 
 * @description
 * Định nghĩa Zod schemas cho validation Users requests.
 * Sử dụng với validateSchema middleware.
 * 
 * ## Schemas:
 * - userIdParamSchema: Validation cho :id param
 * - createUserSchema: Validation cho create user
 * - updateUserSchema: Validation cho update user (partial)
 * 
 * @module modules/users/validation/users.validation
 * @requires zod
 * 
 * =============================================================================
 */

import { z } from 'zod';

// =============================================================================
// Base Schemas
// =============================================================================

/**
 * Schema validation cho user ID parameter.
 * ID phải là string chứa số nguyên dương.
 * @private
 */
const userIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a positive integer'),
  }),
});

/**
 * Base fields cho user body.
 * @private
 */
const baseUserBody = {
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Email is invalid'),
};

// =============================================================================
// Exported Schemas
// =============================================================================

/**
 * Zod schema cho tạo user mới.
 * 
 * @constant {z.ZodObject}
 * @property {z.ZodObject} body - Request body schema
 * @property {string} body.name - Tên user (required)
 * @property {string} body.email - Email address (valid format)
 */
export const createUserSchema = z.object({
  body: z.object(baseUserBody),
});

/**
 * Zod schema cho update user.
 * Tất cả fields là optional nhưng phải có ít nhất 1 field.
 * 
 * @constant {z.ZodObject}
 * @property {z.ZodObject} params - URL params với id
 * @property {z.ZodObject} body - Request body (partial, ít nhất 1 field)
 */
export const updateUserSchema = z.object({
  params: userIdSchema.shape.params,
  body: z.object({
    name: baseUserBody.name.optional(),
    email: baseUserBody.email.optional(),
  }).refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Provide at least one field to update',
    path: ['body'],
  }),
});

/**
 * Zod schema cho user ID parameter validation.
 * Dùng cho routes cần :id param.
 * 
 * @constant {z.ZodObject}
 */
export const userIdParamSchema = userIdSchema;
