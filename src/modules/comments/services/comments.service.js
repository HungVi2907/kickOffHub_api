/**
 * @fileoverview Comments Service
 * @module modules/comments/services/comments
 * @description Business Logic Layer cho Comments module.
 *              Xử lý các nghiệp vụ liên quan đến tạo và xóa bình luận.
 *              Bao gồm validation, authorization và orchestration các repository calls.
 *
 * @requires ../repositories/comments.repository.js - Data access layer
 *
 * @author KickOffHub Team
 * @version 1.0.0
 */

import {
  createCommentRecord,
  deleteCommentRecord,
  findCommentByIdentity,
  findCommentWithAuthor,
  findPostById,
} from '../repositories/comments.repository.js';

/**
 * Validate và chuyển đổi giá trị thành số nguyên dương.
 * Utility function dùng để validate các ID parameters.
 *
 * @function ensurePositiveInteger
 * @param {string|number} value - Giá trị cần validate
 * @param {string} errorCode - Mã lỗi throw nếu validation thất bại
 * @returns {number} Số nguyên dương đã được parse
 * @throws {Error} Throw error với errorCode nếu giá trị không hợp lệ
 * @private
 *
 * @example
 * const postId = ensurePositiveInteger('123', 'INVALID_POST_ID'); // Returns: 123
 * const invalid = ensurePositiveInteger('abc', 'INVALID_ID'); // Throws: Error('INVALID_ID')
 */
function ensurePositiveInteger(value, errorCode) {
  // Parse string thành integer với base 10
  const parsed = Number.parseInt(value, 10);

  // Kiểm tra kết quả có phải số nguyên dương không
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(errorCode);
  }
  return parsed;
}

/**
 * Tạo comment mới cho một bài viết.
 * Thực hiện validation, kiểm tra post tồn tại, tạo comment và trả về kèm thông tin author.
 *
 * @async
 * @function createCommentForPost
 * @param {string|number} postIdRaw - ID của bài viết (raw input từ request)
 * @param {string|number} userId - ID của người dùng tạo comment
 * @param {string} content - Nội dung comment
 * @returns {Promise<Comment>} Comment instance với thông tin author
 * @throws {Error} 'INVALID_POST_ID' - Post ID không hợp lệ
 * @throws {Error} 'INVALID_USER_ID' - User ID không hợp lệ
 * @throws {Error} 'POST_NOT_FOUND' - Bài viết không tồn tại
 *
 * @example
 * const comment = await createCommentForPost('10', 5, 'Great article!');
 * // Returns: { id: 42, content: 'Great article!', author: { id: 5, name: '...' } }
 */
export async function createCommentForPost(postIdRaw, userId, content) {
  // Validate và parse các ID parameters
  const postId = ensurePositiveInteger(postIdRaw, 'INVALID_POST_ID');
  const ownerId = ensurePositiveInteger(userId, 'INVALID_USER_ID');

  // Kiểm tra bài viết có tồn tại không
  const post = await findPostById(postId);
  if (!post) {
    throw new Error('POST_NOT_FOUND');
  }

  // Tạo comment record trong database
  const comment = await createCommentRecord({
    post_id: postId,
    user_id: ownerId,
    content,
  });

  // Trả về comment kèm thông tin author để hiển thị
  return findCommentWithAuthor(comment.id);
}

/**
 * Xóa comment khỏi bài viết.
 * Chỉ cho phép tác giả của comment thực hiện xóa.
 *
 * @async
 * @function removeCommentFromPost
 * @param {string|number} postIdRaw - ID của bài viết chứa comment
 * @param {string|number} commentIdRaw - ID của comment cần xóa
 * @param {string|number} userId - ID của người dùng yêu cầu xóa
 * @returns {Promise<boolean>} true nếu xóa thành công
 * @throws {Error} 'INVALID_POST_ID' - Post ID không hợp lệ
 * @throws {Error} 'INVALID_COMMENT_ID' - Comment ID không hợp lệ
 * @throws {Error} 'INVALID_USER_ID' - User ID không hợp lệ
 * @throws {Error} 'COMMENT_NOT_FOUND' - Comment không tồn tại hoặc không thuộc bài viết này
 * @throws {Error} 'NOT_ALLOWED' - Người dùng không phải tác giả comment
 *
 * @example
 * await removeCommentFromPost('10', '42', 5);
 * // Returns: true (comment deleted successfully)
 */
export async function removeCommentFromPost(postIdRaw, commentIdRaw, userId) {
  // Validate và parse tất cả ID parameters
  const postId = ensurePositiveInteger(postIdRaw, 'INVALID_POST_ID');
  const commentId = ensurePositiveInteger(commentIdRaw, 'INVALID_COMMENT_ID');
  const ownerId = ensurePositiveInteger(userId, 'INVALID_USER_ID');

  // Tìm comment theo cả commentId và postId để đảm bảo tính nhất quán
  const comment = await findCommentByIdentity({ commentId, postId });
  if (!comment) {
    throw new Error('COMMENT_NOT_FOUND');
  }

  // Authorization check: chỉ tác giả mới được xóa comment của mình
  if (comment.user_id !== ownerId) {
    throw new Error('NOT_ALLOWED');
  }

  // Thực hiện xóa comment
  await deleteCommentRecord(comment);
  return true;
}
