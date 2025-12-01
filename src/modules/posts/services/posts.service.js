/**
 * @fileoverview Posts Service - Tầng business logic cho bài viết
 * 
 * Service này xử lý tất cả logic nghiệp vụ liên quan đến bài viết:
 * - CRUD operations với validation
 * - Upload và quản lý hình ảnh qua Cloudinary
 * - Caching với Redis để tối ưu hiệu suất
 * - Transform dữ liệu trước khi trả về client
 * 
 * @module modules/posts/services/posts.service
 * @requires ../../../utils/cloudinaryMedia.js - Cloudinary utilities
 * @requires ../../../common/redisClient.js - Redis client cho caching
 * @requires ../repositories/posts.repository.js - Data access layer
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import {
  createImageUrl,
  buildPostImageKey,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from '../../../utils/cloudinaryMedia.js';
import { redisClient } from '../../../common/redisClient.js';
import {
  createPost,
  deletePost,
  findPaginatedPosts,
  findPostById,
  updatePost,
} from '../repositories/posts.repository.js';

/**
 * @constant {number} DEFAULT_PAGE - Trang mặc định khi không chỉ định
 */
const DEFAULT_PAGE = 1;

/**
 * @constant {number} DEFAULT_LIMIT - Số bài viết mặc định mỗi trang
 */
const DEFAULT_LIMIT = 10;

/**
 * @constant {number} MAX_LIMIT - Giới hạn tối đa số bài viết mỗi trang
 */
const MAX_LIMIT = 50;

/**
 * @constant {number} CACHE_TTL_SECONDS - Thời gian sống của cache (giây)
 * Lấy từ env POSTS_CACHE_TTL, mặc định 60 giây
 */
const CACHE_TTL_SECONDS = Number.parseInt(process.env.POSTS_CACHE_TTL ?? '60', 10);

/**
 * Tạo cache key cho danh sách bài viết
 * 
 * @private
 * @function buildCacheKey
 * @param {number} page - Số trang
 * @param {number} limit - Số bài viết mỗi trang
 * @returns {string} Cache key dạng 'posts:list:{page}:{limit}'
 * 
 * @example
 * buildCacheKey(1, 10) // => 'posts:list:1:10'
 */
function buildCacheKey(page, limit) {
  return `posts:list:${page}:${limit}`;
}

/**
 * Transform Post instance thành response object
 * 
 * Thực hiện:
 * 1. Convert Sequelize instance sang plain object
 * 2. Thay thế image_key bằng full Cloudinary URL
 * 
 * @private
 * @async
 * @function mapPostToResponse
 * @param {Post|null} postInstance - Sequelize Post instance
 * @returns {Promise<Object|null>} Transformed post object hoặc null
 * 
 * @example
 * const response = await mapPostToResponse(post);
 * // { id: 1, title: '...', image_url: 'https://res.cloudinary.com/...' }
 */
async function mapPostToResponse(postInstance) {
  if (!postInstance) {
    return null;
  }

  // Convert Sequelize instance sang plain JavaScript object
  const plain = postInstance.get({ plain: true });
  
  // Destructure để tách image_key, giữ lại các field khác
  const { image_key: imageKey, ...rest } = plain;
  
  // Xử lý image URL:
  // - Nếu imageKey đã là full URL (https://...) thì giữ nguyên
  // - Nếu là key thì tạo URL từ Cloudinary
  let imageUrl = null;
  if (imageKey) {
    if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
      imageUrl = imageKey; // Đã là full URL
    } else {
      imageUrl = createImageUrl(imageKey); // Tạo URL từ key
    }
  }

  return {
    ...rest,
    image_url: imageUrl,
  };
}

/**
 * Transform collection bài viết thành response format
 * 
 * @private
 * @async
 * @function mapPostCollectionToResponse
 * @param {Object} collection - Kết quả từ findAndCountAll
 * @param {number} collection.count - Tổng số bài viết
 * @param {Post[]} collection.rows - Mảng Post instances
 * @returns {Promise<{total: number, rows: Object[]}>} Transformed collection
 */
async function mapPostCollectionToResponse(collection) {
  // Map song song tất cả posts để tối ưu hiệu suất
  const rows = await Promise.all(collection.rows.map(mapPostToResponse));
  return {
    total: collection.count,
    rows,
  };
}

/**
 * Xóa tất cả cache liên quan đến danh sách bài viết
 * 
 * Được gọi khi có thay đổi (create, update, delete) để đảm bảo
 * dữ liệu cache luôn đồng bộ với database.
 * 
 * @private
 * @async
 * @function invalidateCache
 * @returns {Promise<void>}
 */
async function invalidateCache() {
  // Kiểm tra Redis connection
  if (!redisClient.isOpen) {
    return;
  }

  // Tìm tất cả cache keys theo pattern
  const keys = await redisClient.keys('posts:list:*');
  if (!keys.length) {
    return;
  }

  // Xóa tất cả keys tìm được
  await redisClient.del(...keys);
}

/**
 * Lấy danh sách bài viết có phân trang
 * 
 * Luồng xử lý:
 * 1. Validate và normalize params (page, limit)
 * 2. Kiểm tra cache Redis
 * 3. Nếu cache miss, query database và lưu cache
 * 4. Trả về response đã format
 * 
 * @async
 * @function listPosts
 * @param {string|number} pageRaw - Số trang (raw input từ query)
 * @param {string|number} limitRaw - Số bài viết mỗi trang (raw input)
 * @returns {Promise<Object>} Paginated response
 * @returns {number} returns.total - Tổng số bài viết
 * @returns {number} returns.page - Trang hiện tại
 * @returns {number} returns.pageSize - Số bài viết mỗi trang
 * @returns {Object[]} returns.data - Mảng bài viết
 * 
 * @example
 * const result = await listPosts('1', '10');
 * // { total: 100, page: 1, pageSize: 10, data: [...] }
 */
export async function listPosts(pageRaw, limitRaw) {
  // Parse và validate page
  let page = Number.parseInt(pageRaw, 10);
  let limit = Number.parseInt(limitRaw, 10);

  // Fallback về defaults nếu invalid
  if (!Number.isInteger(page) || page < 1) {
    page = DEFAULT_PAGE;
  }

  if (!Number.isInteger(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }

  // Giới hạn limit để tránh query quá lớn
  limit = Math.min(limit, MAX_LIMIT);

  const cacheKey = buildCacheKey(page, limit);

  // Try cache first nếu Redis available
  if (redisClient.isOpen) {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  // Cache miss - Query database
  const collection = await findPaginatedPosts({ page, limit });
  const response = await mapPostCollectionToResponse(collection);
  
  // Build final payload
  const payload = {
    total: response.total,
    page,
    pageSize: limit,
    data: response.rows,
  };

  // Cache result nếu Redis available và TTL > 0
  if (redisClient.isOpen && CACHE_TTL_SECONDS > 0) {
    await redisClient.set(cacheKey, JSON.stringify(payload), {
      EX: CACHE_TTL_SECONDS,
    });
  }

  return payload;
}

/**
 * Lấy chi tiết một bài viết theo ID
 * 
 * @async
 * @function getPostById
 * @param {string|number} idRaw - ID bài viết (raw input)
 * @returns {Promise<Object|null>} Post object hoặc null nếu không tìm thấy
 * @throws {Error} 'INVALID_ID' nếu ID không hợp lệ
 * 
 * @example
 * try {
 *   const post = await getPostById('123');
 * } catch (err) {
 *   if (err.message === 'INVALID_ID') {
 *     // Handle invalid ID
 *   }
 * }
 */
export async function getPostById(idRaw) {
  // Parse và validate ID
  const id = Number.parseInt(idRaw, 10);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('INVALID_ID');
  }

  const post = await findPostById(id);
  return mapPostToResponse(post);
}

/**
 * Tạo bài viết mới với optional image upload
 * 
 * Luồng xử lý:
 * 1. Tạo post record trong database
 * 2. Nếu có file, upload lên Cloudinary
 * 3. Cập nhật image_key vào post
 * 4. Invalidate cache
 * 5. Trả về post đã format
 * 
 * Nếu upload image thất bại, post sẽ bị rollback (xóa).
 * 
 * @async
 * @function createPostWithImage
 * @param {number} userId - ID của user tạo bài
 * @param {Object} body - Request body
 * @param {string} body.title - Tiêu đề bài viết
 * @param {string} body.content - Nội dung bài viết
 * @param {'public'|'draft'} [body.status='public'] - Trạng thái
 * @param {string[]} [body.tags] - Mảng tên tags
 * @param {Object} [file] - Multer file object
 * @param {Buffer} file.buffer - File buffer
 * @param {string} file.originalname - Tên file gốc
 * @param {string} file.mimetype - MIME type
 * @returns {Promise<Object>} Created post object
 * @throws {Error} Lỗi upload Cloudinary hoặc database
 * 
 * @example
 * const post = await createPostWithImage(
 *   userId,
 *   { title: 'New Post', content: 'Content', tags: ['football'] },
 *   req.file
 * );
 */
export async function createPostWithImage(userId, body, file) {
  // Debug log
  console.log('📝 createPostWithImage called');
  console.log('📝 body:', JSON.stringify(body, null, 2));
  console.log('📝 file:', file ? 'has file' : 'no file');

  // Chuẩn bị payload để tạo post
  const payload = {
    user_id: userId,
    title: body.title,
    content: body.content,
    status: body.status || 'public',
    tags: Array.isArray(body.tags) ? body.tags : undefined,
    image_key: null, // Sẽ update sau khi upload hoặc từ imageUrl
  };

  // Case 1: Frontend đã upload ảnh trước và gửi imageUrl (Cloudinary URL)
  // Hỗ trợ cả imageUrl (camelCase) và image_url (snake_case)
  const imageUrl = body.imageUrl || body.image_url;
  console.log('📝 imageUrl from body:', imageUrl);
  
  if (imageUrl && typeof imageUrl === 'string') {
    // Lưu trực tiếp URL vào image_key (sẽ được transform trong mapPostToResponse)
    payload.image_key = imageUrl;
    console.log('📝 Setting payload.image_key to:', imageUrl);
  }

  console.log('📝 Final payload:', JSON.stringify(payload, null, 2));

  // Bước 1: Tạo post record
  const post = await createPost(payload);
  console.log('📝 Post created with id:', post.id, 'image_key:', post.image_key);

  // Case 2: Upload image qua multer file (legacy flow)
  if (file && !imageUrl) {
    // Tạo unique key cho Cloudinary
    const key = buildPostImageKey(post.id, file.originalname || 'post.jpg');
    try {
      await uploadBufferToCloudinary(key, file.buffer, file.mimetype);
      // Update image_key sau khi upload thành công
      post.image_key = key;
      await post.save();
    } catch (err) {
      // Rollback: Xóa post nếu upload thất bại
      await deletePost(post);
      throw err;
    }
  }

  // Bước 3: Invalidate cache và trả về kết quả
  await invalidateCache();
  const fullPost = await findPostById(post.id);
  return mapPostToResponse(fullPost);
}

/**
 * Cập nhật bài viết với optional image handling
 * 
 * Hỗ trợ các trường hợp:
 * - Cập nhật text fields (title, content, status, tags)
 * - Remove image hiện tại (removeImage flag)
 * - Replace image mới
 * 
 * @async
 * @function updatePostWithImage
 * @param {string|number} postIdRaw - ID bài viết
 * @param {Object} body - Request body
 * @param {string} [body.title] - Tiêu đề mới
 * @param {string} [body.content] - Nội dung mới
 * @param {'public'|'draft'} [body.status] - Trạng thái mới
 * @param {string[]} [body.tags] - Tags mới
 * @param {boolean} [body.removeImage] - Flag xóa image hiện tại
 * @param {Object} [file] - Multer file object cho image mới
 * @returns {Promise<Object|null>} Updated post hoặc null nếu không tìm thấy
 * 
 * @example
 * // Update title only
 * await updatePostWithImage('123', { title: 'New Title' });
 * 
 * // Replace image
 * await updatePostWithImage('123', {}, newFile);
 * 
 * // Remove image
 * await updatePostWithImage('123', { removeImage: true });
 */
export async function updatePostWithImage(postIdRaw, body, file) {
  // Tìm post hiện tại
  const post = await findPostById(postIdRaw);
  if (!post) {
    return null;
  }

  // Chuẩn bị updates, giữ nguyên giá trị cũ nếu không có update
  const updates = {
    title: body.title ?? post.title,
    content: body.content ?? post.content,
    status: body.status ?? post.status,
    tags: Array.isArray(body.tags) ? body.tags : undefined,
  };

  let newImageKey = post.image_key;

  // Case 1: Xóa image hiện tại
  if (body.removeImage) {
    await deleteFromCloudinary(post.image_key);
    newImageKey = null;
  }

  // Case 2: Upload image mới
  if (file) {
    const key = buildPostImageKey(post.id, file.originalname || 'post.jpg');
    await uploadBufferToCloudinary(key, file.buffer, file.mimetype);
    
    // Xóa image cũ nếu có và khác key mới
    if (newImageKey && newImageKey !== key) {
      await deleteFromCloudinary(newImageKey);
    }
    newImageKey = key;
  }

  updates.image_key = newImageKey;

  // Thực hiện update
  const updated = await updatePost(post, updates);
  await invalidateCache();
  
  // Reload để có đầy đủ relations
  const refreshed = await findPostById(updated.id);
  return mapPostToResponse(refreshed);
}

/**
 * Xóa bài viết và cleanup resources
 * 
 * Thực hiện:
 * 1. Xóa image từ Cloudinary (nếu có)
 * 2. Xóa post record và tags junction
 * 3. Invalidate cache
 * 
 * @async
 * @function removePost
 * @param {string|number} postIdRaw - ID bài viết cần xóa
 * @returns {Promise<boolean|null>} true nếu xóa thành công, null nếu không tìm thấy
 * 
 * @example
 * const deleted = await removePost('123');
 * if (!deleted) {
 *   // Post not found
 * }
 */
export async function removePost(postIdRaw) {
  const post = await findPostById(postIdRaw);
  if (!post) {
    return null;
  }

  // Cleanup Cloudinary image nếu có
  if (post.image_key) {
    await deleteFromCloudinary(post.image_key);
  }

  // Xóa post và invalidate cache
  await deletePost(post);
  await invalidateCache();
  return true;
}
