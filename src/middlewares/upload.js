/**
 * =============================================================================
 * FILE: src/middlewares/upload.js
 * =============================================================================
 * 
 * @fileoverview File Upload Middleware Re-export
 * 
 * @description
 * Re-export upload middleware từ common folder.
 * Đây là facade để dễ import từ middlewares directory.
 * 
 * @module middlewares/upload
 * @see module:common/uploadMiddleware
 * @exports {Function} handlePostImageUpload - Multer middleware cho post images
 * 
 * @example
 * import { handlePostImageUpload } from './middlewares/upload.js';
 * 
 * router.post('/posts',
 *   authMiddleware,
 *   handlePostImageUpload, // Max 5MB, JPEG/PNG/GIF/WEBP
 *   createPost
 * );
 * 
 * =============================================================================
 */

export { handlePostImageUpload } from '../common/uploadMiddleware.js';
