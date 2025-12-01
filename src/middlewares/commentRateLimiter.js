/**
 * =============================================================================
 * FILE: src/middlewares/commentRateLimiter.js
 * =============================================================================
 * 
 * @fileoverview Comment Rate Limiter Middleware
 * 
 * @description
 * Middleware giới hạn tốc độ bình luận của user.
 * Sử dụng in-memory Map để tracking comment history.
 * 
 * ## Rate Limit Rules:
 * - Window: 60 giây (1 phút)
 * - Max comments: 5 bình luận/window
 * - Áp dụng: Chỉ với authenticated users
 * 
 * ## Behavior:
 * - Anonymous users: Bỏ qua rate limit
 * - Authenticated users: Track theo user ID
 * - Exceeded: Trả về 429 Too Many Requests
 * 
 * ## Limitations:
 * - In-memory storage: Mất data khi restart server
 * - Single instance: Không share giữa multiple servers
 * - Không có cleanup mechanism cho old entries
 * 
 * @module middlewares/commentRateLimiter
 * @requires common/exceptions/AppException
 * 
 * @example
 * import commentRateLimiter from './middlewares/commentRateLimiter.js';
 * 
 * router.post('/comments', authMiddleware, commentRateLimiter, createComment);
 * 
 * =============================================================================
 */

import AppException from '../common/exceptions/AppException.js';

// =============================================================================
// Rate Limit Configuration
// =============================================================================

/**
 * Khoảng thời gian window tính bằng milliseconds.
 * @constant {number}
 * @default 60000 (1 phút)
 */
const WINDOW_MS = 60_000; // 1 phút

/**
 * Số lượng comments tối đa cho phép trong 1 window.
 * @constant {number}
 * @default 5
 */
const MAX_COMMENTS_PER_WINDOW = 5;

/**
 * In-memory storage cho comment history của mỗi user.
 * Key: user ID, Value: Array of timestamps
 * @type {Map<number, number[]>}
 */
const userCommentHistory = new Map();

// =============================================================================
// Middleware
// =============================================================================

/**
 * Rate limiter middleware cho comments.
 * 
 * @function commentRateLimiter
 * @param {import('express').Request} req - Express request với req.user từ auth
 * @param {import('express').Response} _res - Express response (không sử dụng)
 * @param {import('express').NextFunction} next - Next middleware function
 * @throws {AppException} 429 nếu user vượt quá rate limit
 * 
 * @description
 * Workflow:
 * 1. Check user authentication (skip nếu anonymous)
 * 2. Lấy comment history của user từ Map
 * 3. Filter các timestamps trong window hiện tại
 * 4. Nếu >= MAX_COMMENTS_PER_WINDOW: throw 429 error
 * 5. Nếu ok: thêm timestamp mới và continue
 */
export default function commentRateLimiter(req, _res, next) {
  const userId = req.user?.id;
  
  // Bỏ qua rate limit cho anonymous users
  if (!userId) {
    next();
    return;
  }

  const now = Date.now();
  
  // Lấy history hoặc tạo array rỗng
  const history = userCommentHistory.get(userId) || [];
  
  // Chỉ giữ các timestamps trong window hiện tại
  const recentHistory = history.filter((timestamp) => now - timestamp < WINDOW_MS);

  // Kiểm tra rate limit
  if (recentHistory.length >= MAX_COMMENTS_PER_WINDOW) {
    next(new AppException('Bạn bình luận quá nhanh, vui lòng thử lại sau', 'COMMENT_RATE_LIMIT', 429));
    return;
  }

  // Thêm timestamp mới và update Map
  recentHistory.push(now);
  userCommentHistory.set(userId, recentHistory);
  
  next();
}
