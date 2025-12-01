/**
 * =============================================================================
 * FILE: src/modules/users/models/user.model.js
 * =============================================================================
 * 
 * @fileoverview Sequelize User Model Definition
 * 
 * @description
 * Định nghĩa Sequelize model cho bảng users.
 * Bao gồm password hashing và role-based access.
 * 
 * ## Table: users
 * | Column      | Type          | Nullable | Notes            |
 * |-------------|---------------|----------|------------------|
 * | id          | INT           | No       | Primary key, AI  |
 * | name        | VARCHAR       | No       | Full name        |
 * | username    | VARCHAR       | Yes      | Unique           |
 * | email       | VARCHAR       | No       | Unique           |
 * | password    | VARCHAR       | No       | Bcrypt hash      |
 * | role        | ENUM          | No       | user/mod/admin   |
 * | created_at  | TIMESTAMP     | No       |                  |
 * | updated_at  | TIMESTAMP     | No       |                  |
 * 
 * ## Security Features:
 * - Password auto-hashing trước create/update
 * - Default scope loại password khỏi queries
 * - toJSON() tự động xóa password
 * 
 * @module modules/users/models/user.model
 * @requires sequelize
 * @requires bcryptjs
 * @exports {Model} User - Sequelize User model
 * 
 * =============================================================================
 */

import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../../../common/db.js';

// =============================================================================
// Model Definition
// =============================================================================

/**
 * Sequelize User model.
 * 
 * @type {import('sequelize').Model}
 * 
 * @property {number} id - User ID (auto-increment)
 * @property {string} name - Full name
 * @property {string|null} username - Unique username
 * @property {string} email - Email address (unique)
 * @property {string} password - Bcrypt hashed password
 * @property {('user'|'moderator'|'admin')} role - User role
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const User = sequelize.define('User', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true, 
    allowNull: false 
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  username: { 
    type: DataTypes.STRING, 
    allowNull: true, 
    unique: true 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: {
    type: DataTypes.ENUM('user', 'moderator', 'admin'),
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  /**
   * Default scope: loại password ra khỏi tất cả queries.
   * Sử dụng User.scope(null) để lấy password.
   */
  defaultScope: {
    attributes: { exclude: ['password'] },
  },
});

// =============================================================================
// Lifecycle Hooks
// =============================================================================

/**
 * Hook: Auto-hash password trước khi tạo user mới.
 * Sử dụng bcrypt với salt rounds = 10.
 */
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

/**
 * Hook: Auto-hash password trước khi update nếu password thay đổi.
 */
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// =============================================================================
// Instance Methods
// =============================================================================

/**
 * Override toJSON để loại password ra khỏi serialized output.
 * Luôn an toàn khi trả về client.
 * 
 * @returns {Object} User data không có password
 */
User.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;
