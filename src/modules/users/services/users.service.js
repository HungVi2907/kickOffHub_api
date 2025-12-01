/**
 * =============================================================================
 * FILE: src/modules/users/services/users.service.js
 * =============================================================================
 * 
 * @fileoverview Users Business Logic Service
 * 
 * @description
 * Service layer xử lý business logic cho Users.
 * Bao gồm validation, error handling và orchestration.
 * 
 * ## Functions:
 * - listUsers(): Lấy danh sách users
 * - getUserById(id): Lấy user theo ID
 * - createUserRecord(payload): Tạo user mới
 * - updateUserRecord(id, payload): Cập nhật user
 * - removeUser(id): Xóa user
 * 
 * ## Error Codes:
 * - USER_ID_INVALID (400): ID không hợp lệ
 * - USER_NOT_FOUND (404): User không tồn tại
 * - EMAIL_EXISTS (409): Email đã được sử dụng
 * 
 * @module modules/users/services/users.service
 * @requires modules/users/repositories/users.repository
 * 
 * =============================================================================
 */

import {
  createUser,
  deleteUserById,
  findAllUsers,
  findUserByEmail,
  findUserById,
  updateUserById,
} from '../repositories/users.repository.js';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Parse và validate user ID.
 * 
 * @private
 * @function parseUserId
 * @param {string|number} rawId - ID dạng string hoặc number
 * @returns {number} Parsed integer ID
 * @throws {Error} USER_ID_INVALID (400) nếu ID không hợp lệ
 */
function parseUserId(rawId) {
  const parsed = Number.parseInt(rawId, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error('USER_ID_INVALID');
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

// =============================================================================
// Service Functions
// =============================================================================

/**
 * Lấy danh sách tất cả users.
 * 
 * @async
 * @function listUsers
 * @returns {Promise<Array<User>>} Array các User instances
 */
export async function listUsers() {
  return findAllUsers();
}

/**
 * Lấy user theo ID.
 * 
 * @async
 * @function getUserById
 * @param {string|number} idRaw - User ID
 * @returns {Promise<User>} User instance
 * @throws {Error} USER_ID_INVALID (400) nếu ID không hợp lệ
 * @throws {Error} USER_NOT_FOUND (404) nếu user không tồn tại
 */
export async function getUserById(idRaw) {
  const id = parseUserId(idRaw);
  const user = await findUserById(id);
  if (!user) {
    const error = new Error('USER_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

/**
 * Tạo user mới.
 * 
 * @async
 * @function createUserRecord
 * @param {Object} payload - User data
 * @param {string} payload.name - Full name
 * @param {string} payload.email - Email address
 * @param {string} payload.password - Plain text password
 * @returns {Promise<User>} Created User instance
 * @throws {Error} EMAIL_EXISTS (409) nếu email đã tồn tại
 */
export async function createUserRecord(payload) {
  // Kiểm tra email đã tồn tại
  const existing = await findUserByEmail(payload.email);
  if (existing) {
    const error = new Error('EMAIL_EXISTS');
    error.statusCode = 409;
    throw error;
  }
  return createUser(payload);
}

/**
 * Cập nhật user theo ID.
 * 
 * @async
 * @function updateUserRecord
 * @param {string|number} idRaw - User ID
 * @param {Object} payload - Fields cần update
 * @returns {Promise<User>} Updated User instance
 * @throws {Error} USER_ID_INVALID (400) nếu ID không hợp lệ
 * @throws {Error} USER_NOT_FOUND (404) nếu user không tồn tại
 */
export async function updateUserRecord(idRaw, payload) {
  const id = parseUserId(idRaw);
  const affected = await updateUserById(id, payload);
  if (!affected) {
    const error = new Error('USER_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return findUserById(id);
}

/**
 * Xóa user theo ID.
 * 
 * @async
 * @function removeUser
 * @param {string|number} idRaw - User ID
 * @returns {Promise<boolean>} true nếu xóa thành công
 * @throws {Error} USER_ID_INVALID (400) nếu ID không hợp lệ
 * @throws {Error} USER_NOT_FOUND (404) nếu user không tồn tại
 */
export async function removeUser(idRaw) {
  const id = parseUserId(idRaw);
  const removed = await deleteUserById(id);
  if (!removed) {
    const error = new Error('USER_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }
  return true;
}
