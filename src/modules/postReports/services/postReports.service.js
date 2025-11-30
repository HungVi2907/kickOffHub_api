import { findPostById } from '../../posts/repositories/posts.repository.js';
import {
  countReportsForPost,
  createReport,
  findReportByUser,
  updateReport,
} from '../repositories/postReports.repository.js';

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
