/**
 * =============================================================================
 * FILE: src/modules/auth/services/auth.service.js
 * =============================================================================
 * 
 * @fileoverview Authentication Business Logic Service
 * 
 * @description
 * Service xử lý các nghiệp vụ authentication:
 * - User registration với password hashing
 * - User login với credential verification
 * - JWT token generation
 * 
 * ## Security Features:
 * - Password hashing với bcryptjs
 * - JWT tokens với configurable expiration
 * - Auto-generated usernames từ email
 * 
 * ## Error Codes:
 * - EMAIL_EXISTS (409): Email đã được đăng ký
 * - INVALID_CREDENTIALS (401): Email hoặc password sai
 * 
 * @module modules/auth/services/auth.service
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires config/auth
 * @requires modules/users/repositories/users.repository
 * 
 * =============================================================================
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../../../config/auth.js';
import {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
} from '../../users/repositories/users.repository.js';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Build JWT payload từ user object.
 * Chỉ bao gồm các trường cần thiết để giữ token nhỏ.
 * 
 * @private
 * @param {Object} user - User object
 * @param {number} user.id - User ID
 * @param {string} user.email - User email
 * @returns {Object} JWT payload
 */
function buildTokenPayload(user) {
  return { id: user.id, email: user.email };
}

/**
 * Sign JWT token cho user.
 * 
 * @private
 * @param {Object} user - User object
 * @returns {string} Signed JWT token
 */
function signToken(user) {
  return jwt.sign(buildTokenPayload(user), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate username từ email address.
 * Format: {localPart}_{timestamp}
 * 
 * @private
 * @param {string} email - Email address
 * @returns {string} Generated username
 * 
 * @example
 * generateUsername('john@example.com')
 * // Returns: 'john_1699123456789'
 */
function generateUsername(email) {
  const localPart = email.split('@')[0] || 'user';
  return `${localPart}_${Date.now()}`;
}

// =============================================================================
// Public Service Functions
// =============================================================================

/**
 * Đăng ký user mới.
 * 
 * @async
 * @function registerUser
 * @param {Object} payload - Registration data
 * @param {string} payload.name - User's full name
 * @param {string} payload.email - User's email address
 * @param {string} payload.password - Plain text password
 * @returns {Promise<Object>} Registration result
 * @returns {string} result.token - JWT token
 * @returns {Object} result.user - User data (sanitized)
 * @throws {Error} EMAIL_EXISTS (409) nếu email đã tồn tại
 * 
 * @description
 * Workflow:
 * 1. Kiểm tra email đã tồn tại chưa
 * 2. Tạo user với auto-generated username
 * 3. Password được hash bởi repository layer
 * 4. Generate và return JWT token
 */
export async function registerUser(payload) {
  // Kiểm tra email đã tồn tại
  const existing = await findUserByEmail(payload.email);
  if (existing) {
    const error = new Error('EMAIL_EXISTS');
    error.statusCode = 409;
    throw error;
  }

  // Tạo user mới
  const user = await createUser({
    name: payload.name,
    email: payload.email,
    username: generateUsername(payload.email),
    password: payload.password,
  });

  // Generate token và return
  const token = signToken(user);
  return { token, user: user.toJSON() };
}

/**
 * Đăng nhập user.
 * 
 * @async
 * @function loginUser
 * @param {Object} payload - Login credentials
 * @param {string} payload.email - User's email address
 * @param {string} payload.password - Plain text password
 * @returns {Promise<Object>} Login result
 * @returns {string} result.token - JWT token
 * @returns {Object} result.user - User data (sanitized)
 * @throws {Error} INVALID_CREDENTIALS (401) nếu email/password sai
 * 
 * @description
 * Workflow:
 * 1. Tìm user theo email (bao gồm password hash)
 * 2. So sánh password với bcrypt
 * 3. Generate và return JWT token
 */
export async function loginUser(payload) {
  // Tìm user với password hash
  const user = await findUserByEmailWithPassword(payload.email);
  if (!user) {
    const error = new Error('INVALID_CREDENTIALS');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const match = await bcrypt.compare(payload.password, user.password);
  if (!match) {
    const error = new Error('INVALID_CREDENTIALS');
    error.statusCode = 401;
    throw error;
  }

  // Generate token và return (sanitize user - remove password)
  const token = signToken(user);
  const sanitized = user.toJSON();
  return { token, user: sanitized };
}
