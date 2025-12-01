/**
 * =============================================================================
 * FILE: src/utils/ensurePostsSchema.js
 * =============================================================================
 * 
 * @fileoverview Posts Table Schema Migration Utility
 * 
 * @description
 * Utility function để đảm bảo bảng posts có cột image_url.
 * Dùng cho database migration khi thêm feature upload ảnh.
 * 
 * ## Use Case:
 * - Database cũ không có cột image_url
 * - Tự động thêm cột khi khởi động app
 * - Idempotent: chạy nhiều lần không lỗi
 * 
 * ## Column Specification:
 * - Name: image_url
 * - Type: VARCHAR(500)
 * - Nullable: true
 * - Default: null
 * 
 * @module utils/ensurePostsSchema
 * @requires sequelize
 * @requires common/db
 * 
 * @example
 * import { ensurePostImageColumn } from './utils/ensurePostsSchema.js';
 * 
 * // Khởi động app
 * await ensurePostImageColumn();
 * 
 * =============================================================================
 */

import { DataTypes } from 'sequelize'
import sequelize from '../common/db.js'

// =============================================================================
// Schema Migration
// =============================================================================

/**
 * Đảm bảo bảng posts có cột image_url.
 * Nếu cột đã tồn tại, bỏ qua.
 * 
 * @async
 * @function ensurePostImageColumn
 * @returns {Promise<boolean>} True nếu cột được thêm, false nếu đã tồn tại
 * @throws {Error} Nếu không thể kiểm tra hoặc thêm cột
 * 
 * @description
 * Workflow:
 * 1. Lấy thông tin cấu trúc bảng posts
 * 2. Kiểm tra cột image_url tồn tại chưa
 * 3. Nếu chưa: thêm cột với ALTER TABLE
 * 4. Xử lý race condition (ER_DUP_FIELDNAME)
 */
export async function ensurePostImageColumn() {
  const queryInterface = sequelize.getQueryInterface()
  let tableDefinition

  // Kiểm tra cấu trúc bảng hiện tại
  try {
    tableDefinition = await queryInterface.describeTable('posts')
  } catch (error) {
    console.error('Không thể kiểm tra cấu trúc bảng posts:', error)
    throw error
  }

  // Nếu cột đã tồn tại, không cần thêm
  if (tableDefinition.image_url) {
    return false
  }

  // Thêm cột image_url
  try {
    await queryInterface.addColumn('posts', 'image_url', {
      type: DataTypes.STRING(500),  // VARCHAR(500) cho URL dài
      allowNull: true,               // Cho phép null
      defaultValue: null,            // Mặc định null
    })
    console.log('Đã bổ sung cột image_url cho bảng posts.')
    return true
  } catch (error) {
    // Xử lý race condition: cột đã được thêm bởi process khác
    if (error.original?.code === 'ER_DUP_FIELDNAME') {
      console.warn('Cột image_url đã tồn tại, bỏ qua.')
      return false
    }
    throw error
  }
}
