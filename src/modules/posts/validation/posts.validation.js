/**
 * @fileoverview Posts Validation Schemas - Zod schemas cho validation bài viết
 * 
 * File này định nghĩa các Zod schemas để validate request data cho Posts API.
 * Các schemas được sử dụng với validateSchema middleware để tự động validate
 * và trả về lỗi 400 nếu data không hợp lệ.
 * 
 * @module modules/posts/validation/posts.validation
 * @requires zod - Schema validation library
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { z } from 'zod';

/**
 * Schema cho một tag item
 * 
 * Quy tắc:
 * - Phải là string
 * - Trim whitespace
 * - Độ dài từ 2-30 ký tự
 * 
 * @type {z.ZodString}
 */
const tagItemSchema = z.string().trim().min(2).max(30);

/**
 * Schema cho mảng tags
 * 
 * Quy tắc:
 * - Mảng các tagItemSchema
 * - Tối đa 10 tags mỗi bài viết
 * 
 * @type {z.ZodArray}
 */
const tagsArraySchema = z.array(tagItemSchema).max(10, 'Too many tags');

/**
 * Schema validate Post ID từ route params
 * 
 * Sử dụng cho các endpoints yêu cầu :id param.
 * ID phải là chuỗi số nguyên dương.
 * 
 * @type {z.ZodObject}
 * 
 * @example
 * // Validate route /api/posts/:id
 * router.get('/posts/:id', validateSchema(postIdParamSchema), controller);
 */
export const postIdParamSchema = z.object({
  params: z.object({
    /** Post ID - phải là số nguyên dương dạng string */
    id: z.string().regex(/^\d+$/, 'Post ID must be a positive integer'),
  }),
});

/**
 * Schema validate request body khi tạo bài viết mới
 * 
 * Required fields:
 * - title: Tiêu đề (không rỗng sau trim)
 * - content: Nội dung (không rỗng sau trim)
 * 
 * Optional fields:
 * - status: 'public' hoặc 'draft'
 * - tags: Mảng tags (tối thiểu 1 nếu có)
 * 
 * @type {z.ZodObject}
 * 
 * @example
 * // Valid request body
 * {
 *   title: "Match Analysis",
 *   content: "Detailed breakdown...",
 *   status: "public",
 *   tags: ["football", "analysis"]
 * }
 */
export const createPostSchema = z.object({
  body: z.object({
    /** Tiêu đề bài viết - Bắt buộc, không rỗng */
    title: z.string().trim().min(1, 'Title is required'),
    
    /** Nội dung bài viết - Bắt buộc, không rỗng */
    content: z.string().trim().min(1, 'Content is required'),
    
    /** Trạng thái bài viết - Optional, default 'public' */
    status: z.enum(['public', 'draft']).optional(),
    
    /** Mảng tags - Optional, nhưng nếu có phải ít nhất 1 tag */
    tags: tagsArraySchema.min(1, 'At least one tag is required').optional(),
  }),
});

/**
 * Schema validate request khi cập nhật bài viết
 * 
 * Kết hợp:
 * - params: Validate :id từ postIdParamSchema
 * - body: Tất cả fields đều optional (partial update)
 * 
 * Body fields:
 * - title: Optional, không rỗng nếu có
 * - content: Optional, không rỗng nếu có
 * - status: Optional, 'public' hoặc 'draft'
 * - tags: Optional, mảng tags
 * - removeImage: Optional, boolean để xóa image hiện tại
 * 
 * @type {z.ZodObject}
 * 
 * @example
 * // Partial update - chỉ cập nhật title
 * { title: "New Title" }
 * 
 * @example
 * // Xóa image hiện tại
 * { removeImage: true }
 */
export const updatePostSchema = z.object({
  /** Validate :id param - sử dụng lại từ postIdParamSchema */
  params: postIdParamSchema.shape.params,
  
  body: z.object({
    /** Tiêu đề mới - Optional */
    title: z.string().trim().min(1).optional(),
    
    /** Nội dung mới - Optional */
    content: z.string().trim().min(1).optional(),
    
    /** Trạng thái mới - Optional */
    status: z.enum(['public', 'draft']).optional(),
    
    /** Mảng tags mới - Optional, replace toàn bộ nếu có */
    tags: tagsArraySchema.optional(),
    
    /** 
     * Flag xóa image hiện tại
     * z.coerce.boolean() để handle cả string 'true'/'false' từ form-data
     */
    removeImage: z.coerce.boolean().optional(),
  }),
});
