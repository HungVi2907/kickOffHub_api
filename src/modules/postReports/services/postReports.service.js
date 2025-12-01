/**
 * @file Post Reports Service
 * @description Business logic layer for post report operations. Handles report
 * creation, updates, and validation for content moderation.
 * @module modules/postReports/services/postReports
 */

import { findPostById } from '../../posts/repositories/posts.repository.js';
import {
  countReportsForPost,
  createReport,
  findReportByUser,
  updateReport,
} from '../repositories/postReports.repository.js';

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
 * Reports a post for moderation review.
 * Creates a new report or updates an existing one if the user already reported the post.
 * @async
 * @function reportPost
 * @param {string|number} postIdRaw - Raw post ID value
 * @param {number} userId - ID of the reporting user
 * @param {string|null} reasonRaw - Optional reason for the report
 * @returns {Promise<Object>} Report result object
 * @returns {number} returns.id - Report ID
 * @returns {string} returns.status - Report status ('pending' or 'reviewed')
 * @returns {string|null} returns.reason - Report reason if provided
 * @returns {number} returns.totalReports - Total number of reports for this post
 * @throws {Error} If authentication required (401), invalid post ID (400), or post not found (404)
 */
export async function reportPost(postIdRaw, userId, reasonRaw) {
  if (!userId) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    throw error;
  }

  const postId = normalizePostId(postIdRaw);
  await assertPostExists(postId);

  const reason = reasonRaw?.toString().trim() || null;
  const existing = await findReportByUser(postId, userId);
  let report;

  if (existing) {
    report = await updateReport(existing, {
      reason,
      status: 'pending',
    });
  } else {
    report = await createReport(postId, userId, reason);
  }

  const totalReports = await countReportsForPost(postId);
  return {
    id: report.id,
    status: report.status,
    reason: report.reason,
    totalReports,
  };
}
