import {
  createCommentRecord,
  deleteCommentRecord,
  findCommentByIdentity,
  findCommentWithAuthor,
  findPostById,
} from '../repositories/comments.repository.js';

function ensurePositiveInteger(value, errorCode) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(errorCode);
  }
  return parsed;
}

export async function createCommentForPost(postIdRaw, userId, content) {
  const postId = ensurePositiveInteger(postIdRaw, 'INVALID_POST_ID');
  const ownerId = ensurePositiveInteger(userId, 'INVALID_USER_ID');
  const post = await findPostById(postId);
  if (!post) {
    throw new Error('POST_NOT_FOUND');
  }

  const comment = await createCommentRecord({
    post_id: postId,
    user_id: ownerId,
    content,
  });

  return findCommentWithAuthor(comment.id);
}

export async function removeCommentFromPost(postIdRaw, commentIdRaw, userId) {
  const postId = ensurePositiveInteger(postIdRaw, 'INVALID_POST_ID');
  const commentId = ensurePositiveInteger(commentIdRaw, 'INVALID_COMMENT_ID');
  const ownerId = ensurePositiveInteger(userId, 'INVALID_USER_ID');

  const comment = await findCommentByIdentity({ commentId, postId });
  if (!comment) {
    throw new Error('COMMENT_NOT_FOUND');
  }

  if (comment.user_id !== ownerId) {
    throw new Error('NOT_ALLOWED');
  }

  await deleteCommentRecord(comment);
  return true;
}
