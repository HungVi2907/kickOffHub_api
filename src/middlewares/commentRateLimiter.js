const WINDOW_MS = 60_000; // 1 phút
const MAX_COMMENTS_PER_WINDOW = 5;

const userCommentHistory = new Map();

export default function commentRateLimiter(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    next();
    return;
  }

  const now = Date.now();
  const history = userCommentHistory.get(userId) || [];
  const recentHistory = history.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recentHistory.length >= MAX_COMMENTS_PER_WINDOW) {
    res.status(429).json({ error: 'Bạn bình luận quá nhanh, vui lòng thử lại sau' });
    return;
  }

  recentHistory.push(now);
  userCommentHistory.set(userId, recentHistory);
  next();
}
