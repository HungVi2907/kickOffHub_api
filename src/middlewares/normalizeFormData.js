/**
 * =============================================================================
 * FILE: src/middlewares/normalizeFormData.js
 * =============================================================================
 * 
 * @fileoverview Form Data Normalization Middleware
 * 
 * @description
 * Middleware để parse và normalize JSON fields trong form data.
 * Xử lý trường hợp multipart/form-data gửi arrays/objects dưới dạng string.
 * 
 * ## Use Cases:
 * - Multipart forms gửi JSON arrays/objects
 * - Comma-separated values cần chuyển thành array
 * - Form fields cần parse từ string sang native types
 * 
 * ## Parsing Strategy:
 * 1. Thử JSON.parse() trước
 * 2. Nếu fail: fallback sang comma-separated parsing
 * 3. Trim và filter empty values
 * 
 * @module middlewares/normalizeFormData
 * 
 * @example
 * import { parseJsonFields } from './middlewares/normalizeFormData.js';
 * 
 * router.post('/posts',
 *   upload.single('image'),
 *   parseJsonFields(['tags', 'teamIds']), // Parse fields sau upload
 *   createPost
 * );
 * 
 * // Input: { tags: '["football","news"]' } hoặc { tags: 'football,news' }
 * // Output: { tags: ['football', 'news'] }
 * 
 * =============================================================================
 */

// =============================================================================
// Middleware Factory
// =============================================================================

/**
 * Factory function tạo middleware để parse JSON fields trong request body.
 * 
 * @function parseJsonFields
 * @param {string[]} [fields=[]] - Danh sách field names cần parse
 * @returns {import('express').RequestHandler} Express middleware function
 * 
 * @description
 * Middleware này xử lý 2 trường hợp:
 * 1. Field là JSON string valid → JSON.parse()
 * 2. Field là comma-separated string → split và trim
 * 
 * @example
 * // JSON string input
 * req.body.tags = '["tag1", "tag2"]'
 * // After middleware:
 * req.body.tags = ['tag1', 'tag2']
 * 
 * // Comma-separated input
 * req.body.tags = 'tag1, tag2, tag3'
 * // After middleware:
 * req.body.tags = ['tag1', 'tag2', 'tag3']
 */
export function parseJsonFields(fields = []) {
  return (req, res, next) => {
    fields.forEach((field) => {
      const value = req.body[field]
      
      // Chỉ xử lý nếu value là string
      if (typeof value === 'string') {
        try {
          // Thử parse như JSON
          const parsed = JSON.parse(value)
          req.body[field] = parsed
        } catch (error) {
          // Fallback: xử lý như comma-separated list
          req.body[field] = value
            .split(',')              // Split theo dấu phẩy
            .map((item) => item.trim()) // Trim whitespace
            .filter(Boolean)          // Loại bỏ empty strings
        }
      }
    })
    next()
  }
}
