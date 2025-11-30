import { UniqueConstraintError } from 'sequelize';
import {
  countLikes,
  createLike,
  deleteLike,
  findLikeByUser,
} from '../repositories/postLikes.repository.js';
import { findPostById } from '../../posts/repositories/posts.repository.js';

function normalizePostId(postIdRaw) {
  const postId = Number.parseInt(postIdRaw, 10);
  if (!Number.isInteger(postId) || postId < 1) {
    const error = new Error('Post ID is invalid');
    error.statusCode = 400;
    throw error;
  }
  return postId;
}

async function assertPostExists(postId) {
  const post = await findPostById(postId);
  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }
}

export async function toggleLike(postIdRaw, userId) {
  if (!userId) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    throw error;
  }

  const postId = normalizePostId(postIdRaw);
  await assertPostExists(postId);

  const existing = await findLikeByUser(postId, userId);
  let liked;
  if (existing) {
    await deleteLike(existing);
    liked = false;
  } else {
    try {
      await createLike(postId, userId);
      liked = true;
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        // Another request created the like first; fall back to existing state.
        liked = true;
      } else {
        throw err;
      }
    }
  }

  const likeCount = await countLikes(postId);
  return { liked, likeCount };
}

export async function getLikeSummary(postIdRaw, userId) {
  const postId = normalizePostId(postIdRaw);
  await assertPostExists(postId);

  const [existing, likeCount] = await Promise.all([
    userId ? findLikeByUser(postId, userId) : null,
    countLikes(postId),
  ]);

  return { liked: Boolean(existing), likeCount };
}
