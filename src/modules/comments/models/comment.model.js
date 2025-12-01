/**
 * @fileoverview Comment Model Definition
 * @module modules/comments/models/comment
 * @description Sequelize model định nghĩa cấu trúc bảng comments trong database.
 *              Mô hình hóa các bình luận của người dùng trên bài viết.
 *
 * @requires sequelize - Sequelize DataTypes
 * @requires ../../../common/db.js - Database connection instance
 * @requires ../../users/models/user.model.js - User model cho association
 * @requires ../../posts/models/post.model.js - Post model cho association
 *
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';
import User from '../../users/models/user.model.js';
import Post from '../../posts/models/post.model.js';

/**
 * Comment Model - Đại diện cho một bình luận trong hệ thống.
 *
 * @typedef {Object} CommentAttributes
 * @property {number} id - Primary key, auto-increment
 * @property {number} post_id - Foreign key liên kết đến bài viết
 * @property {number} user_id - Foreign key liên kết đến người dùng (tác giả)
 * @property {string} content - Nội dung bình luận
 * @property {Date} created_at - Thời điểm tạo bình luận
 * @property {Date} updated_at - Thời điểm cập nhật gần nhất
 */

/**
 * @type {import('sequelize').Model<CommentAttributes>}
 * @description Sequelize Model instance cho Comment entity.
 *              Mapping với bảng 'comments' trong database.
 */
const Comment = sequelize.define('Comment', {
  /** @property {number} id - Khóa chính, tự động tăng */
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  /** @property {number} post_id - ID của bài viết chứa bình luận */
  post_id: { type: DataTypes.INTEGER, allowNull: false },

  /** @property {number} user_id - ID của người dùng tạo bình luận */
  user_id: { type: DataTypes.INTEGER, allowNull: false },

  /** @property {string} content - Nội dung văn bản của bình luận */
  content: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

/*
 * ============================================
 * Model Associations (Quan hệ giữa các model)
 * ============================================
 */

// Comment thuộc về một Post (Many-to-One)
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Comment thuộc về một User (Many-to-One) - Tác giả bình luận
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Post có nhiều Comments (One-to-Many)
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });

// User có nhiều Comments (One-to-Many)
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });

export default Comment;
