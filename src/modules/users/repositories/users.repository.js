/**
 * =============================================================================
 * FILE: src/modules/users/repositories/users.repository.js
 * =============================================================================
 * 
 * @fileoverview Users Data Access Repository
 * 
 * @description
 * Repository layer cho User model.
 * Cung cấp các functions để tương tác với database.
 * 
 * ## Functions:
 * - findAllUsers(): Lấy tất cả users
 * - findUserById(id): Lấy user theo ID
 * - findUserByEmail(email): Lấy user theo email (không password)
 * - findUserByEmailWithPassword(email): Lấy user với password hash
 * - createUser(payload): Tạo user mới
 * - updateUserById(id, payload): Cập nhật user
 * - deleteUserById(id): Xóa user
 * 
 * ## Notes:
 * - Mặc định không trả về password (default scope)
 * - Dùng scope(null) để lấy password cho authentication
 * 
 * @module modules/users/repositories/users.repository
 * @requires modules/users/models/user.model
 * 
 * =============================================================================
 */

import User from '../models/user.model.js';

// =============================================================================
// Query Functions
// =============================================================================

/**
 * Lấy tất cả users.
 * 
 * @function findAllUsers
 * @returns {Promise<Array<User>>} Array các User instances
 */
export function findAllUsers() {
  return User.findAll();
}

/**
 * Lấy user theo primary key (ID).
 * 
 * @function findUserById
 * @param {number|string} id - User ID
 * @returns {Promise<User|null>} User instance hoặc null
 */
export function findUserById(id) {
  return User.findByPk(id);
}

/**
 * Lấy user theo email (không bao gồm password).
 * Dùng cho kiểm tra email đã tồn tại.
 * 
 * @function findUserByEmail
 * @param {string} email - Email address
 * @returns {Promise<User|null>} User instance hoặc null
 */
export function findUserByEmail(email) {
  return User.findOne({ where: { email } });
}

/**
 * Lấy user theo email BAO GỒM password hash.
 * Dùng cho authentication - so sánh password.
 * 
 * @function findUserByEmailWithPassword
 * @param {string} email - Email address
 * @returns {Promise<User|null>} User instance với password hoặc null
 * 
 * @description
 * Sử dụng scope(null) để bypass default scope
 * và include password field.
 */
export function findUserByEmailWithPassword(email) {
  return User.scope(null).findOne({ where: { email } });
}

// =============================================================================
// Mutation Functions
// =============================================================================

/**
 * Tạo user mới.
 * Password sẽ được tự động hash bởi model hook.
 * 
 * @function createUser
 * @param {Object} payload - User data
 * @param {string} payload.name - Full name
 * @param {string} payload.email - Email address
 * @param {string} payload.password - Plain text password
 * @param {string} [payload.username] - Optional username
 * @returns {Promise<User>} Created User instance
 */
export function createUser(payload) {
  return User.create(payload);
}

/**
 * Cập nhật user theo ID.
 * 
 * @async
 * @function updateUserById
 * @param {number|string} id - User ID
 * @param {Object} payload - Fields cần update
 * @returns {Promise<number>} Số rows bị ảnh hưởng (0 hoặc 1)
 */
export async function updateUserById(id, payload) {
  const [affected] = await User.update(payload, { where: { id } });
  return affected;
}

/**
 * Xóa user theo ID.
 * 
 * @function deleteUserById
 * @param {number|string} id - User ID
 * @returns {Promise<number>} Số rows bị xóa (0 hoặc 1)
 */
export function deleteUserById(id) {
  return User.destroy({ where: { id } });
}
