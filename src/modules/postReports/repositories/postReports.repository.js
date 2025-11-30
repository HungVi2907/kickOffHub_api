import PostReport from '../models/postReport.model.js';

export function findReportByUser(postId, userId) {
  return PostReport.findOne({ where: { post_id: postId, user_id: userId } });
}

export function createReport(postId, userId, reason) {
  return PostReport.create({ post_id: postId, user_id: userId, reason });
}

export function updateReport(report, updates) {
  return report.update(updates);
}

export function countReportsForPost(postId) {
  return PostReport.count({ where: { post_id: postId } });
}
