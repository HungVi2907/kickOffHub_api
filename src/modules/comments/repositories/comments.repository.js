/**
 * @fileoverview Comments Repository
 * @module modules/comments/repositories/comments
 * @description Data Access Layer cho Comments module.
 *              Cung cấp các hàm truy vấn database liên quan đến bình luận.
 *              Tách biệt logic truy cập dữ liệu khỏi business logic.
 *
 * @requires ../models/comment.model.js - Comment Sequelize model
 * @requires ../../posts/models/post.model.js - Post Sequelize model
 * @requires ../../users/models/user.model.js - User Sequelize model
 *
 * @author KickOffHub Team
 * @version 1.0.0
 */

import Comment from '../models/comment.model.js';
import Post from '../../posts/models/post.model.js';
import User from '../../users/models/user.model.js';

/**
 * Tìm bài viết theo ID.
 * Trả về thông tin cơ bản của bài viết để validate trước khi tạo comment.
 *
 * @function findPostById
 * @param {number} id - ID của bài viết cần tìm
 * @returns {Promise<Post|null>} Post instance hoặc null nếu không tìm thấy
 *
 * @example
 * const post = await findPostById(123);
 * if (!post) {
 *   throw new Error('POST_NOT_FOUND');
 * }
 */
export function findPostById(id) {
  return Post.findByPk(id, {
    attributes: ['id', 'title', 'user_id'],
  });
}

/**
 * Tạo mới một bản ghi comment trong database.
 *
 * @function createCommentRecord
 * @param {Object} data - Dữ liệu comment cần tạo
 * @param {number} data.post_id - ID của bài viết
 * @param {number} data.user_id - ID của người tạo comment
 * @param {string} data.content - Nội dung comment
 * @returns {Promise<Comment>} Comment instance vừa được tạo
 *
 * @example
 * const comment = await createCommentRecord({
 *   post_id: 1,
 *   user_id: 5,
 *   content: 'Great post!'
 * });
 */
export function createCommentRecord(data) {
  return Comment.create(data);
}

/**
 * Tìm comment theo ID và post ID.
 * Sử dụng để xác minh comment thuộc về đúng bài viết trước khi thao tác.
 *
 * @function findCommentByIdentity
 * @param {Object} params - Tham số tìm kiếm
 * @param {number} params.commentId - ID của comment
 * @param {number} params.postId - ID của bài viết chứa comment
 * @returns {Promise<Comment|null>} Comment instance hoặc null nếu không tìm thấy
 *
 * @example
 * const comment = await findCommentByIdentity({ commentId: 42, postId: 10 });
 */
export function findCommentByIdentity({ commentId, postId }) {
  return Comment.findOne({
    where: { id: commentId, post_id: postId },
  });
}

/**
 * Tìm comment theo ID kèm thông tin tác giả.
 * Eager loading thông tin User để hiển thị trong response.
 *
 * @function findCommentWithAuthor
 * @param {number} id - ID của comment cần tìm
 * @returns {Promise<Comment|null>} Comment instance với author association hoặc null
 *
 * @example
 * const comment = await findCommentWithAuthor(42);
 * console.log(comment.author.name); // "John Doe"
 */
export function findCommentWithAuthor(id) {
  return Comment.findByPk(id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
  });
}

/**
 * Xóa một bản ghi comment khỏi database.
 *
 * @function deleteCommentRecord
 * @param {Comment|null} commentInstance - Sequelize Comment instance cần xóa
 * @returns {Promise<void>|null} Promise resolve khi xóa thành công, null nếu instance không hợp lệ
 *
 * @example
 * const comment = await findCommentByIdentity({ commentId: 42, postId: 10 });
 * await deleteCommentRecord(comment);
 */
export function deleteCommentRecord(commentInstance) {
  // Guard clause: kiểm tra instance có tồn tại không
  if (!commentInstance) {
    return null;
  }
  return commentInstance.destroy();
}
