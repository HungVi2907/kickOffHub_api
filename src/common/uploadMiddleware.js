/**
 * =============================================================================
 * FILE: src/common/uploadMiddleware.js
 * =============================================================================
 * 
 * @fileoverview File Upload Middleware với Multer
 * 
 * @description
 * File này cung cấp middleware để xử lý file uploads sử dụng Multer.
 * Hỗ trợ upload images với validation và giới hạn size.
 * 
 * ## Features:
 * - Memory storage (files stored in buffer)
 * - File type validation (JPEG, PNG, WEBP, GIF)
 * - File size limit (3MB)
 * - Error handling với ValidationException
 * 
 * ## Supported MIME Types:
 * - image/jpeg
 * - image/png
 * - image/webp
 * - image/gif
 * 
 * @module common/uploadMiddleware
 * @requires multer
 * @requires ./exceptions/ValidationException.js
 * 
 * @example
 * import { handlePostImageUpload } from './common/uploadMiddleware.js';
 * 
 * router.post('/posts', handlePostImageUpload, PostsController.create);
 * // req.file sẽ chứa uploaded file (nếu có)
 * 
 * =============================================================================
 */

import multer from 'multer';
import ValidationException from './exceptions/ValidationException.js';

/**
 * Danh sách MIME types được phép upload
 * @constant {string[]}
 */
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Multer uploader instance
 * 
 * @type {Multer}
 * @description
 * Cấu hình Multer:
 * - Memory storage: File được lưu trong buffer (req.file.buffer)
 * - Size limit: 3MB max
 * - File filter: Chỉ chấp nhận image formats
 */
const uploader = multer({
  // Memory storage - file được giữ trong RAM
  // Phù hợp khi upload lên cloud storage (Cloudinary)
  storage: multer.memoryStorage(),
  
  // Giới hạn
  limits: {
    fileSize: 3 * 1024 * 1024,  // 3MB in bytes
  },
  
  /**
   * File filter function
   * Kiểm tra MIME type trước khi accept file
   */
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);  // Accept file
      return;
    }
    // Reject file với error message
    cb(new Error('Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WEBP, GIF.'));
  },
});

/**
 * Middleware xử lý upload image cho posts
 * 
 * @function handlePostImageUpload
 * @description
 * Wrapper middleware cho multer.single('image').
 * Xử lý errors và convert thành ValidationException.
 * 
 * ## Sau khi xử lý:
 * - req.file: Uploaded file object (hoặc undefined nếu không có file)
 *   - req.file.buffer: File content
 *   - req.file.originalname: Original filename
 *   - req.file.mimetype: File MIME type
 * 
 * ## Possible Errors:
 * - File quá lớn (> 3MB)
 * - File type không được hỗ trợ
 * - Lỗi upload khác
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 * 
 * @example
 * router.post('/posts',
 *   handlePostImageUpload,  // req.file sẽ có sau middleware này
 *   validateSchema(createPostSchema),
 *   PostsController.create
 * );
 */
export function handlePostImageUpload(req, res, next) {
  // Sử dụng multer.single() để xử lý field 'image'
  uploader.single('image')(req, res, (err) => {
    if (err) {
      // Convert multer error thành ValidationException
      const message = err.message || 'Không thể tải ảnh lên';
      next(new ValidationException(message, 'INVALID_IMAGE_FORMAT'));
      return;
    }
    // Không có lỗi, continue với next middleware
    next();
  });
}

export default uploader;
