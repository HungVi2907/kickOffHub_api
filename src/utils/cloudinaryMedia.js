/**
 * =============================================================================
 * FILE: src/utils/cloudinaryMedia.js
 * =============================================================================
 * 
 * @fileoverview Cloudinary Media Operations
 * 
 * @description
 * Utility functions để upload, generate URLs, và delete images trên Cloudinary.
 * Sử dụng cho post images trong KickOffHub.
 * 
 * ## Functions:
 * - buildPostImageKey(): Tạo unique key cho post image
 * - uploadBufferToCloudinary(): Upload buffer tới Cloudinary
 * - createImageUrl(): Generate URL từ public ID
 * - deleteFromCloudinary(): Xóa image
 * 
 * ## Key Format:
 * `{folder}/post_{postId}_{uuid}_{filename}`
 * 
 * @module utils/cloudinaryMedia
 * @requires crypto
 * @requires utils/cloudinaryClient
 * 
 * @example
 * import { buildPostImageKey, uploadBufferToCloudinary, createImageUrl } from './cloudinaryMedia.js';
 * 
 * const key = buildPostImageKey(postId, 'my-image.jpg');
 * const result = await uploadBufferToCloudinary(key, imageBuffer, 'image/jpeg');
 * const url = createImageUrl(result.public_id);
 * 
 * =============================================================================
 */

import crypto from 'node:crypto';
import cloudinary, { cloudinaryConfigured, cloudinaryFolder } from './cloudinaryClient.js';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Default options cho URL generation.
 * @type {Object}
 * @property {boolean} secure - Sử dụng HTTPS
 */
const DEFAULT_URL_OPTIONS = { secure: true };

// =============================================================================
// Key Generation
// =============================================================================

/**
 * Tạo unique key cho post image trên Cloudinary.
 * Key bao gồm folder, post ID, UUID và sanitized filename.
 * 
 * @function buildPostImageKey
 * @param {number|string} postId - ID của post
 * @param {string} [originalName='post.jpg'] - Tên file gốc
 * @returns {string} Unique key cho Cloudinary public_id
 * 
 * @example
 * buildPostImageKey(123, 'my photo.png')
 * // Returns: 'kickoffhub/posts/post_123_abc123_my_photo.png'
 */
export function buildPostImageKey(postId, originalName = 'post.jpg') {
  // Sanitize filename: thay thế ký tự đặc biệt bằng underscore
  const safeName = originalName.replace(/[^a-zA-Z0-9.\-_/]/g, '_');
  
  // Generate unique suffix sử dụng UUID hoặc random bytes
  const suffix = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  
  // Build key: folder/post_id_uuid_filename
  return `${cloudinaryFolder.replace(/\/$/, '')}/post_${postId}_${suffix}_${safeName}`;
}

// =============================================================================
// Upload Operations
// =============================================================================

/**
 * Upload buffer tới Cloudinary.
 * Sử dụng upload_stream API cho memory-efficient uploads.
 * 
 * @async
 * @function uploadBufferToCloudinary
 * @param {string} key - Public ID cho image (từ buildPostImageKey)
 * @param {Buffer} buffer - Image data dưới dạng Buffer
 * @param {string} contentType - MIME type (e.g., 'image/jpeg')
 * @returns {Promise<Object>} Cloudinary upload result
 * @throws {Error} Nếu Cloudinary chưa được cấu hình hoặc upload fails
 * 
 * @example
 * const result = await uploadBufferToCloudinary(
 *   'kickoffhub/posts/post_123_uuid_image.jpg',
 *   imageBuffer,
 *   'image/jpeg'
 * );
 * console.log(result.secure_url); // HTTPS URL
 * console.log(result.public_id);  // Cloudinary public ID
 */
export async function uploadBufferToCloudinary(key, buffer, contentType) {
  if (!cloudinaryConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    // Tạo upload stream với options
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: key,
        resource_type: 'image',
        overwrite: true,  // Ghi đè nếu tồn tại
        format: contentType?.split('/')?.pop(), // Extract format từ MIME type
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      },
    );

    // Gửi buffer và kết thúc stream
    uploadStream.end(buffer);
  });
}

// =============================================================================
// URL Generation
// =============================================================================

/**
 * Tạo URL cho image từ public ID.
 * 
 * @function createImageUrl
 * @param {string} publicId - Cloudinary public ID
 * @returns {string|null} HTTPS URL hoặc null nếu invalid
 * 
 * @example
 * const url = createImageUrl('kickoffhub/posts/post_123_uuid_image');
 * // Returns: 'https://res.cloudinary.com/.../kickoffhub/posts/post_123_uuid_image'
 */
export function createImageUrl(publicId) {
  if (!publicId || !cloudinaryConfigured) {
    return null;
  }

  return cloudinary.url(publicId, DEFAULT_URL_OPTIONS);
}

// =============================================================================
// Delete Operations
// =============================================================================

/**
 * Xóa image từ Cloudinary.
 * Silent failure - chỉ log warning nếu xóa thất bại.
 * 
 * @async
 * @function deleteFromCloudinary
 * @param {string} publicId - Cloudinary public ID cần xóa
 * @returns {Promise<void>}
 * 
 * @example
 * await deleteFromCloudinary('kickoffhub/posts/post_123_uuid_image');
 */
export async function deleteFromCloudinary(publicId) {
  if (!publicId || !cloudinaryConfigured) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    // Silent failure với warning log
    console.warn('Failed to delete Cloudinary asset', publicId, err.message);
  }
}
