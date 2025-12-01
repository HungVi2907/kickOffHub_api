/**
 * =============================================================================
 * FILE: src/config/auth.js
 * =============================================================================
 * 
 * @fileoverview JWT Authentication Configuration
 * 
 * @description
 * Cấu hình cho JWT authentication bao gồm secret key và expiration time.
 * Các giá trị được lấy từ environment variables với fallback defaults.
 * 
 * ## Environment Variables:
 * - JWT_SECRET: Secret key để sign/verify JWT tokens
 * - JWT_EXPIRES_IN: Token expiration time (mặc định '1h')
 * 
 * ## Security Notes:
 * - ⚠️ PHẢI set JWT_SECRET trong production
 * - Fallback 'dev-secret-change-me' chỉ dùng cho development
 * 
 * @module config/auth
 * @exports {string} JWT_SECRET - Secret key cho JWT
 * @exports {string} JWT_EXPIRES_IN - Token expiration time
 * 
 * =============================================================================
 */

/**
 * JWT Secret key để sign và verify tokens.
 * @constant {string}
 * @default 'dev-secret-change-me' - Chỉ dùng cho development
 */
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/**
 * JWT expiration time.
 * @constant {string}
 * @default '1h' - 1 giờ
 * @see https://github.com/vercel/ms for time format
 */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Cảnh báo nếu không set JWT_SECRET trong production
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Using fallback dev secret; please set JWT_SECRET in production.');
}

export { JWT_SECRET, JWT_EXPIRES_IN };
