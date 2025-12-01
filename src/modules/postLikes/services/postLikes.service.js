/**
 * @file Post Likes Service
 * @description Business logic layer for post like operations. Handles like
 * toggling, validation, and like count aggregation.
 * @module modules/postLikes/services/postLikes
 */

import { UniqueConstraintError } from 'sequelize';
import {
  countLikes,
  createLike,
  deleteLike,
  findLikeByUser,
} from '../repositories/postLikes.repository.js';
import { findPostById } from '../../posts/repositories/posts.repository.js';
import { invalidatePostsCache } from '../../posts/services/posts.service.js';

/**
 * Normalizes and validates a post ID from raw input.
 * @function normalizePostId
 * @param {string|number} postIdRaw - Raw post ID value
 * @returns {number} Validated positive integer post ID
 * @throws {Error} If post ID is invalid (400 status code)
 */
function normalizePostId(postIdRaw) {
  const postId = Number.parseInt(postIdRaw, 10);
  if (!Number.isInteger(postId) || postId < 1) {
    const error = new Error('Post ID is invalid');
    error.statusCode = 400;
    throw error;
  }
  return postId;
}

/**
 * Asserts that a post exists in the database.
 * @async
 * @function assertPostExists
 * @param {number} postId - Post ID to check
 * @throws {Error} If post not found (404 status code)
 */
async function assertPostExists(postId) {
  const post = await findPostById(postId);
  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }
}

/**
 * Toggles the like state for a post by the authenticated user.
 * If the user already liked the post, removes the like. Otherwise, adds a like.
 * @async
 * @function toggleLike
 * @param {string|number} postIdRaw - Raw post ID value
 * @param {number} userId - ID of the authenticated user
 * @returns {Promise<Object>} Like toggle result
 * @returns {boolean} returns.liked - Whether the post is now liked by the user
 * @returns {number} returns.likeCount - Total number of likes on the post
 * @throws {Error} If authentication required (401), invalid post ID (400), or post not found (404)
 */
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

  // Invalidate posts list cache since likeCount changed
  await invalidatePostsCache();

  const likeCount = await countLikes(postId);
  return { liked, likeCount };
}

/**
 * Adds a like to a post by the authenticated user.
 * @async
 * @function addLike
 * @param {string|number} postIdRaw - Raw post ID value
 * @param {number} userId - ID of the authenticated user
 * @returns {Promise<Object>} Like result
 * @returns {boolean} returns.liked - Always true after adding
 * @returns {number} returns.likeCount - Total number of likes on the post
 * @throws {Error} If authentication required (401), invalid post ID (400), or post not found (404)
 */
export async function addLike(postIdRaw, userId) {
  if (!userId) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    throw error;
  }

  const postId = normalizePostId(postIdRaw);
  await assertPostExists(postId);

  const existing = await findLikeByUser(postId, userId);
  if (!existing) {
    try {
      await createLike(postId, userId);
      // Invalidate posts list cache since likeCount changed
      await invalidatePostsCache();
    } catch (err) {
      if (!(err instanceof UniqueConstraintError)) {
        throw err;
      }
      // Already liked by another concurrent request - that's fine
    }
  }

  const likeCount = await countLikes(postId);
  return { liked: true, likeCount };
}

/**
 * Removes a like from a post by the authenticated user.
 * @async
 * @function removeLike
 * @param {string|number} postIdRaw - Raw post ID value
 * @param {number} userId - ID of the authenticated user
 * @returns {Promise<Object>} Unlike result
 * @returns {boolean} returns.liked - Always false after removing
 * @returns {number} returns.likeCount - Total number of likes on the post
 * @throws {Error} If authentication required (401), invalid post ID (400), or post not found (404)
 */
export async function removeLike(postIdRaw, userId) {
  if (!userId) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    throw error;
  }

  const postId = normalizePostId(postIdRaw);
  await assertPostExists(postId);

  const existing = await findLikeByUser(postId, userId);
  if (existing) {
    await deleteLike(existing);
    // Invalidate posts list cache since likeCount changed
    await invalidatePostsCache();
  }

  const likeCount = await countLikes(postId);
  return { liked: false, likeCount };
}

/**
 * Retrieves the like summary for a post.
 * @async
 * @function getLikeSummary
 * @param {string|number} postIdRaw - Raw post ID value
 * @param {number|null} userId - ID of the current user (null if not authenticated)
 * @returns {Promise<Object>} Like summary object
 * @returns {boolean} returns.liked - Whether the current user liked the post
 * @returns {number} returns.likeCount - Total number of likes on the post
 * @throws {Error} If invalid post ID (400) or post not found (404)
 */
export async function getLikeSummary(postIdRaw, userId) {
  const postId = normalizePostId(postIdRaw);
  await assertPostExists(postId);

  const [existing, likeCount] = await Promise.all([
    userId ? findLikeByUser(postId, userId) : null,
    countLikes(postId),
  ]);

  return { liked: Boolean(existing), likeCount };
}
