/**
 * @fileoverview Posts Repository - Tầng truy cập dữ liệu cho bài viết
 * 
 * Repository này cung cấp các phương thức CRUD và query phức tạp cho bài viết,
 * bao gồm phân trang, quan hệ với User/Tags/Comments, và quản lý tags.
 * 
 * Tất cả các thao tác ghi (create, update, delete) đều sử dụng transaction
 * để đảm bảo tính toàn vẹn dữ liệu.
 * 
 * @module modules/posts/repositories/posts.repository
 * @requires sequelize - Sequelize Op operators
 * @requires ../../../common/db.js - Database connection với transaction support
 * @requires ../models/post.model.js - Post model
 * @requires ../../users/models/user.model.js - User model
 * @requires ../../comments/models/comment.model.js - Comment model
 * @requires ../../tags/models/tag.model.js - Tag model
 * @requires ../models/postTag.model.js - PostTag junction model
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { Op, fn, col, literal } from 'sequelize';
import sequelize from '../../../common/db.js';
import Post from '../models/post.model.js';
import User from '../../users/models/user.model.js';
import Comment from '../../comments/models/comment.model.js';
import Tag from '../../tags/models/tag.model.js';
import PostTag from '../models/postTag.model.js';
import PostLike from '../../postLikes/models/postLike.model.js';

/**
 * Lấy danh sách bài viết có phân trang
 * 
 * Query bao gồm thông tin author và tags, sắp xếp theo thời gian tạo mới nhất
 * hoặc theo số lượng likes (khi sort='likes').
 * Hỗ trợ filter theo search (keyword), tag, và status.
 * 
 * @async
 * @function findPaginatedPosts
 * @param {Object} options - Tham số phân trang, sắp xếp và filter
 * @param {number} options.page - Số trang (bắt đầu từ 1)
 * @param {number} options.limit - Số bài viết mỗi trang
 * @param {string} [options.sort] - Cách sắp xếp: 'likes' | 'newest' (default)
 * @param {string} [options.search] - Từ khóa tìm kiếm trong title và content
 * @param {string} [options.tag] - Tên tag để filter
 * @param {string} [options.status] - Trạng thái: 'public' | 'draft'
 * @returns {Promise<{count: number, rows: Post[]}>} Kết quả findAndCountAll
 * @returns {number} returns.count - Tổng số bài viết
 * @returns {Post[]} returns.rows - Mảng bài viết của trang hiện tại
 * 
 * @example
 * const result = await findPaginatedPosts({ page: 1, limit: 10, sort: 'likes', search: 'tactics' });
 * console.log(`Total: ${result.count}, Current page: ${result.rows.length}`);
 */
export async function findPaginatedPosts({ page, limit, sort, search, tag, status }) {
  // Tính offset dựa trên page (1-indexed)
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const whereConditions = {};

  // Search filter: search in title and content
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    whereConditions[Op.or] = [
      { title: { [Op.like]: searchTerm } },
      { content: { [Op.like]: searchTerm } }
    ];
  }

  // Status filter
  if (status && status.trim() && status !== 'all') {
    whereConditions.status = status.trim();
  }

  // Determine order based on sort parameter
  let order;
  let attributes;
  let subQuery;

  if (sort === 'likes') {
    // Sort by like count descending, then by created_at descending
    // Use subquery to count likes for each post
    attributes = {
      include: [
        [
          literal('(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = Post.id)'),
          'likeCount'
        ]
      ]
    };
    order = [[literal('likeCount'), 'DESC'], ['created_at', 'DESC']];
    subQuery = false;
  } else {
    // Default: sort by created_at descending (newest first)
    order = [['created_at', 'DESC']];
  }

  // Build tag include with optional filter
  const tagInclude = {
    model: Tag,
    as: 'tags',
    through: { attributes: [] }
  };

  // If tag filter is provided, add where condition to tag include
  if (tag && tag.trim()) {
    tagInclude.where = { name: { [Op.like]: `%${tag.trim()}%` } };
    tagInclude.required = true; // INNER JOIN to filter posts by tag
  }

  return Post.findAndCountAll({
    attributes,
    where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    include: [
      // Include author với id, name, và username để hiển thị
      { model: User, as: 'author', attributes: ['id', 'name', 'username'] },
      // Include tags với optional filter
      tagInclude
    ],
    order,
    limit,
    offset,
    subQuery,
    distinct: true, // Ensure accurate count with includes
  });
}

/**
 * Tìm bài viết theo ID với đầy đủ thông tin liên quan
 * 
 * Bao gồm author, tags, và tất cả comments (với author của mỗi comment).
 * Sử dụng cho trang chi tiết bài viết.
 * 
 * @async
 * @function findPostById
 * @param {number|string} id - ID của bài viết cần tìm
 * @returns {Promise<Post|null>} Post instance hoặc null nếu không tìm thấy
 * 
 * @example
 * const post = await findPostById(123);
 * if (post) {
 *   console.log(post.title, post.author.username, post.comments.length);
 * }
 */
export async function findPostById(id) {
  return Post.findByPk(id, {
    include: [
      // Author của bài viết với đầy đủ thông tin
      { model: User, as: 'author', attributes: ['id', 'name', 'username'] },
      // Danh sách tags đã gắn
      { model: Tag, as: 'tags', through: { attributes: [] } },
      {
        // Nested include: Comments với author của mỗi comment
        model: Comment,
        as: 'comments',
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'username'] }]
      }
    ]
  });
}

/**
 * Tạo bài viết mới với transaction
 * 
 * Nếu có tags, sẽ tự động sync (tạo tag mới nếu chưa có, liên kết với post).
 * Toàn bộ thao tác được wrap trong transaction để rollback nếu có lỗi.
 * 
 * @async
 * @function createPost
 * @param {Object} data - Dữ liệu bài viết
 * @param {number} data.user_id - ID của user tạo bài
 * @param {string} data.title - Tiêu đề bài viết
 * @param {string} data.content - Nội dung bài viết
 * @param {'public'|'draft'} [data.status='public'] - Trạng thái
 * @param {string[]} [data.tags] - Mảng tên tags
 * @param {string|null} [data.image_key] - Cloudinary image key
 * @returns {Promise<Post>} Post instance đã tạo
 * @throws {Error} Lỗi database hoặc validation
 * 
 * @example
 * const post = await createPost({
 *   user_id: 1,
 *   title: 'New Post',
 *   content: 'Content here',
 *   tags: ['football', 'premier-league']
 * });
 */
export async function createPost(data) {
  return sequelize.transaction(async (transaction) => {
    // Tách tags ra khỏi postData để xử lý riêng
    const { tags, ...postData } = data;
    const post = await Post.create(postData, { transaction });

    // Sync tags nếu có
    if (tags?.length) {
      await syncPostTags(post.id, tags, transaction);
    }

    return post;
  });
}

/**
 * Cập nhật bài viết với transaction
 * 
 * Nếu tags được cung cấp (kể cả mảng rỗng), sẽ sync lại toàn bộ tags.
 * Điều này cho phép xóa tất cả tags bằng cách truyền mảng rỗng.
 * 
 * @async
 * @function updatePost
 * @param {Post} post - Post instance cần cập nhật
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} [data.title] - Tiêu đề mới
 * @param {string} [data.content] - Nội dung mới
 * @param {'public'|'draft'} [data.status] - Trạng thái mới
 * @param {string[]} [data.tags] - Mảng tags mới (nếu là array, sẽ replace toàn bộ)
 * @param {string|null} [data.image_key] - Image key mới
 * @returns {Promise<Post>} Post instance đã cập nhật
 * 
 * @example
 * const updatedPost = await updatePost(existingPost, {
 *   title: 'Updated Title',
 *   tags: ['new-tag']
 * });
 */
export async function updatePost(post, data) {
  return sequelize.transaction(async (transaction) => {
    // Tách tags để xử lý riêng
    const { tags, ...updateData } = data;
    await post.update(updateData, { transaction });

    // Chỉ sync tags nếu tags được truyền vào (Array.isArray check)
    // Điều này phân biệt giữa undefined (không thay đổi) và [] (xóa tất cả)
    if (Array.isArray(tags)) {
      await syncPostTags(post.id, tags, transaction);
    }

    return post;
  });
}

/**
 * Xóa bài viết và các liên kết tags
 * 
 * Thực hiện trong transaction:
 * 1. Xóa tất cả PostTag records liên quan
 * 2. Xóa Post record
 * 
 * @async
 * @function deletePost
 * @param {Post} post - Post instance cần xóa
 * @returns {Promise<void>}
 * @throws {Error} Lỗi database
 * 
 * @example
 * const post = await findPostById(123);
 * if (post) {
 *   await deletePost(post);
 * }
 */
export async function deletePost(post) {
  return sequelize.transaction(async (transaction) => {
    // Xóa junction records trước để tránh foreign key constraint
    await PostTag.destroy({ where: { post_id: post.id }, transaction });
    // Sau đó xóa post
    await post.destroy({ transaction });
  });
}

/**
 * Đồng bộ tags cho một bài viết
 * 
 * Xử lý logic phức tạp:
 * 1. Normalize tags: trim, lowercase, loại bỏ trùng lặp và rỗng
 * 2. Tìm các tags đã tồn tại trong database
 * 3. Tạo tags mới cho những tags chưa có
 * 4. Xóa tất cả liên kết cũ của post
 * 5. Tạo liên kết mới với tất cả tags
 * 
 * @async
 * @function syncPostTags
 * @param {number} postId - ID của bài viết
 * @param {string[]} tags - Mảng tên tags
 * @param {Transaction} transaction - Sequelize transaction instance
 * @returns {Promise<void>}
 * 
 * @example
 * await syncPostTags(1, ['Football', 'PREMIER-LEAGUE', 'analysis'], transaction);
 * // Kết quả: tags được normalize thành ['football', 'premier-league', 'analysis']
 */
export async function syncPostTags(postId, tags, transaction) {
  // Step 1: Normalize tags - trim, lowercase, unique, filter empty
  const normalized = Array.from(new Set(tags.map((tag) => String(tag).trim().toLowerCase()))).filter(Boolean);

  // Step 2: Tìm các tags đã tồn tại
  const existingTags = await Tag.findAll({
    where: { name: { [Op.in]: normalized } },
    transaction,
  });

  // Tạo Map để lookup nhanh theo tên
  const existingByName = new Map(existingTags.map((tag) => [tag.name, tag]));

  const tagIds = [];

  // Step 3: Duyệt qua từng tag, tạo mới nếu chưa có
  for (const tagName of normalized) {
    const existing = existingByName.get(tagName);
    if (existing) {
      tagIds.push(existing.id);
      continue;
    }

    // Tag chưa tồn tại, tạo mới
    const created = await Tag.create({ name: tagName }, { transaction });
    tagIds.push(created.id);
  }

  // Step 4: Xóa tất cả liên kết cũ của post này
  await PostTag.destroy({ where: { post_id: postId }, transaction });

  // Step 5: Tạo các liên kết mới
  if (tagIds.length) {
    await PostTag.bulkCreate(
      tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })),
      { transaction }
    );
  }
}
