/**
 * =============================================================================
 * FILE: src/utils/cloudinaryClient.js
 * =============================================================================
 * 
 * @fileoverview Cloudinary SDK Configuration
 * 
 * @description
 * Cấu hình và khởi tạo Cloudinary SDK cho image storage.
 * Cloudinary được sử dụng để lưu trữ và serve images cho posts.
 * 
 * ## Environment Variables:
 * - CLOUDINARY_CLOUD_NAME: Cloud name từ Cloudinary dashboard
 * - CLOUDINARY_API_KEY: API key cho authentication
 * - CLOUDINARY_API_SECRET: API secret cho authentication
 * - CLOUDINARY_FOLDER: Folder để lưu images (default: 'kickoffhub/posts')
 * 
 * ## Features:
 * - Auto-configure từ environment variables
 * - HTTPS bắt buộc (secure: true)
 * - Export flag kiểm tra configuration status
 * 
 * ## Usage:
 * ```javascript
 * import cloudinary, { cloudinaryConfigured, cloudinaryFolder } from './cloudinaryClient.js';
 * 
 * if (cloudinaryConfigured) {
 *   const result = await cloudinary.uploader.upload(filePath);
 * }
 * ```
 * 
 * @module utils/cloudinaryClient
 * @requires cloudinary
 * @exports {Object} default - Cloudinary v2 instance
 * @exports {boolean} cloudinaryConfigured - True nếu đủ credentials
 * @exports {string} cloudinaryFolder - Folder path cho uploads
 * 
 * =============================================================================
 */

import { v2 as cloudinary } from 'cloudinary';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Cloudinary cloud name từ environment.
 * @type {string|undefined}
 */
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

/**
 * Cloudinary API key từ environment.
 * @type {string|undefined}
 */
const apiKey = process.env.CLOUDINARY_API_KEY;

/**
 * Cloudinary API secret từ environment.
 * @type {string|undefined}
 */
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Cảnh báo nếu thiếu credentials
if (!cloudName || !apiKey || !apiSecret) {
  console.warn('Cloudinary credentials are not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
}

// =============================================================================
// SDK Configuration
// =============================================================================

/**
 * Cấu hình Cloudinary SDK với credentials.
 */
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,  // Bắt buộc HTTPS
});

// =============================================================================
// Exports
// =============================================================================

/**
 * Flag cho biết Cloudinary đã được cấu hình đầy đủ chưa.
 * Sử dụng để check trước khi thực hiện operations.
 * @type {boolean}
 */
export const cloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

/**
 * Folder path để lưu images trên Cloudinary.
 * @type {string}
 * @default 'kickoffhub/posts'
 */
export const cloudinaryFolder = process.env.CLOUDINARY_FOLDER || 'kickoffhub/posts';

export default cloudinary;
