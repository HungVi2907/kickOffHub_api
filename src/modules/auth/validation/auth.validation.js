/**
 * =============================================================================
 * FILE: src/modules/auth/validation/auth.validation.js
 * =============================================================================
 * 
 * @fileoverview Authentication Zod Validation Schemas
 * 
 * @description
 * Định nghĩa Zod schemas cho validation authentication requests.
 * Sử dụng với validateSchema middleware.
 * 
 * ## Schemas:
 * - registerSchema: Validation cho registration form
 * - loginSchema: Validation cho login form
 * 
 * ## Validation Rules:
 * - Email: Must be valid email format
 * - Password: Minimum 6 characters (register), non-empty (login)
 * - Name: Non-empty string (register only)
 * 
 * @module modules/auth/validation/auth.validation
 * @requires zod
 * 
 * @example
 * import { validateSchema } from '../../../middlewares/validateSchema.js';
 * import { registerSchema } from './auth.validation.js';
 * 
 * router.post('/register', validateSchema(registerSchema), controller);
 * 
 * =============================================================================
 */

import { z } from 'zod';

// =============================================================================
// Validation Schemas
// =============================================================================

/**
 * Zod schema cho user registration.
 * 
 * @constant {z.ZodObject}
 * @property {z.ZodObject} body - Request body schema
 * @property {string} body.name - Tên user (required, trim)
 * @property {string} body.email - Email address (valid format)
 * @property {string} body.password - Password (min 6 chars)
 */
export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Email is invalid'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

/**
 * Zod schema cho user login.
 * 
 * @constant {z.ZodObject}
 * @property {z.ZodObject} body - Request body schema
 * @property {string} body.email - Email address (valid format)
 * @property {string} body.password - Password (non-empty)
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Email is invalid'),
    password: z.string().min(1, 'Password is required'),
  }),
});
