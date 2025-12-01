/**
 * =============================================================================
 * FILE: src/utils/ensureTeamsSchema.js
 * =============================================================================
 * 
 * @fileoverview Teams Table Schema Migration Utility
 * 
 * @description
 * Utility function để đảm bảo bảng teams có cột is_popular.
 * Dùng cho database migration khi thêm feature popular teams.
 * 
 * ## Use Case:
 * - Database cũ không có cột is_popular
 * - Tự động thêm cột khi khởi động app
 * - Kiểm tra cả snake_case và camelCase naming
 * 
 * ## Column Specification:
 * - Name: is_popular
 * - Type: BOOLEAN
 * - Nullable: false
 * - Default: false
 * - Position: sau cột venue_id
 * 
 * @module utils/ensureTeamsSchema
 * @requires sequelize
 * @requires common/db
 * 
 * @example
 * import { ensurePopularFlagColumn } from './utils/ensureTeamsSchema.js';
 * 
 * // Khởi động app
 * await ensurePopularFlagColumn();
 * 
 * =============================================================================
 */

import { DataTypes } from 'sequelize';
import sequelize from '../common/db.js';

// =============================================================================
// Schema Migration
// =============================================================================

/**
 * Đảm bảo bảng teams có cột is_popular.
 * Kiểm tra cả snake_case (is_popular) và camelCase (isPopular).
 * 
 * @async
 * @function ensurePopularFlagColumn
 * @returns {Promise<void>}
 * @throws {Error} Nếu không thể kiểm tra hoặc thêm cột
 * 
 * @description
 * Older database dumps có thể không có cột này.
 * Function này đảm bảo backward compatibility với legacy data.
 */
export async function ensurePopularFlagColumn() {
  const queryInterface = sequelize.getQueryInterface();
  const tableName = 'teams';

  try {
    // Lấy danh sách cột hiện tại
    const columns = await queryInterface.describeTable(tableName);
    
    // Kiểm tra cả 2 naming conventions
    const hasSnakeCase = Object.prototype.hasOwnProperty.call(columns, 'is_popular');
    const hasCamelCase = Object.prototype.hasOwnProperty.call(columns, 'isPopular');

    // Chỉ thêm nếu chưa tồn tại
    if (!hasSnakeCase && !hasCamelCase) {
      await queryInterface.addColumn(tableName, 'is_popular', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,  // Mặc định: không popular
        after: 'venue_id'     // Đặt sau cột venue_id
      });
      console.log('Added missing is_popular column to teams table.');
    }
  } catch (error) {
    console.error('Failed to verify or add teams.is_popular column:', error);
    throw error;
  }
}
