/**
 * @fileoverview Comments Validation Schemas
 * @module modules/comments/validation/comments
 * @description Zod validation schemas cho Comments API.
 *              Định nghĩa các rules validate request data trước khi xử lý.
 *
 * @requires zod - Schema validation library
 *
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { z } from 'zod';

/**
 * Schema validate ID parameter.
 * Đảm bảo ID là chuỗi chỉ chứa số (positive integer dạng string).
 *
 * @type {import('zod').ZodString}
 * @constant
 * @private
 *
 * @example
 * idParam.parse('123'); // OK
 * idParam.parse('abc'); // Throws ZodError
 * idParam.parse('-1');  // Throws ZodError
 */
const idParam = z.string().regex(/^\d+$/, 'Must be a positive integer');

/**
 * Validation schema cho API tạo comment.
 * Validate request params và body cho POST /api/posts/:postId/comments
 *
 * @type {import('zod').ZodObject}
 * @constant
 *
 * @property {Object} params - Route parameters
 * @property {string} params.postId - ID của bài viết (phải là số nguyên dương)
 * @property {Object} body - Request body
 * @property {string} body.content - Nội dung comment (5-500 ký tự, tự động trim)
 *
 * @example
 * // Valid request:
 * createCommentSchema.parse({
 *   params: { postId: '123' },
 *   body: { content: 'This is a comment' }
 * });
 *
 * @example
 * // Invalid - content too short:
 * createCommentSchema.parse({
 *   params: { postId: '123' },
 *   body: { content: 'Hi' } // Error: min 5 characters
 * });
 */
export const createCommentSchema = z.object({
  params: z.object({
    /** @property {string} postId - ID bài viết, phải là số nguyên dương dạng string */
    postId: idParam,
  }),
  body: z.object({
    /** @property {string} content - Nội dung comment, 5-500 ký tự */
    content: z.string().trim().min(5).max(500),
  }),
});

/**
 * Validation schema cho API xóa comment.
 * Validate request params cho DELETE /api/posts/:postId/comments/:commentId
 *
 * @type {import('zod').ZodObject}
 * @constant
 *
 * @property {Object} params - Route parameters
 * @property {string} params.postId - ID của bài viết (phải là số nguyên dương)
 * @property {string} params.commentId - ID của comment cần xóa (phải là số nguyên dương)
 *
 * @example
 * // Valid request:
 * deleteCommentSchema.parse({
 *   params: { postId: '123', commentId: '456' }
 * });
 */
export const deleteCommentSchema = z.object({
  params: z.object({
    /** @property {string} postId - ID bài viết, phải là số nguyên dương dạng string */
    postId: idParam,
    /** @property {string} commentId - ID comment, phải là số nguyên dương dạng string */
    commentId: idParam,
  }),
});
