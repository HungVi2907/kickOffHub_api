/**
 * @fileoverview Post Model Definition - Định nghĩa model bài viết
 * 
 * File này định nghĩa Sequelize model cho bảng `posts` trong database,
 * bao gồm các trường dữ liệu và quan hệ với model User.
 * 
 * @module modules/posts/models/post.model
 * @requires sequelize - Sequelize DataTypes
 * @requires ../../../common/db.js - Database connection instance
 * @requires ../../users/models/user.model.js - User model để thiết lập quan hệ
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';
import User from '../../users/models/user.model.js';

/**
 * @typedef {Object} PostAttributes
 * @property {number} id - Primary key, auto-increment
 * @property {number} user_id - Foreign key tham chiếu đến users.id
 * @property {string} title - Tiêu đề bài viết (tối đa 255 ký tự)
 * @property {string} content - Nội dung bài viết (TEXT)
 * @property {'public'|'draft'} status - Trạng thái bài viết
 * @property {string|null} image_key - Cloudinary image key (lưu trong cột image_url)
 * @property {Date} created_at - Thời gian tạo
 * @property {Date} updated_at - Thời gian cập nhật cuối
 */

/**
 * Sequelize Model đại diện cho bảng `posts`
 * 
 * Bảng này lưu trữ các bài viết của người dùng trong hệ thống,
 * mỗi bài viết có thể có hình ảnh đính kèm và được gắn tags.
 * 
 * @type {import('sequelize').Model<PostAttributes>}
 * 
 * @example
 * // Tạo bài viết mới
 * const post = await Post.create({
 *   user_id: 1,
 *   title: 'Match Review',
 *   content: 'Detailed analysis...',
 *   status: 'public'
 * });
 * 
 * @example
 * // Lấy bài viết với author
 * const post = await Post.findByPk(1, {
 *   include: [{ model: User, as: 'author' }]
 * });
 */
const Post = sequelize.define('Post', {
  /** Primary key - ID tự động tăng */
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  
  /** Foreign key - ID của user tạo bài viết */
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  
  /** Tiêu đề bài viết - Bắt buộc, tối đa 255 ký tự */
  title: { type: DataTypes.STRING(255), allowNull: false },
  
  /** Nội dung bài viết - Bắt buộc, kiểu TEXT để lưu nội dung dài */
  content: { type: DataTypes.TEXT, allowNull: false },
  
  /** Trạng thái: 'public' (công khai) hoặc 'draft' (bản nháp) */
  status: { type: DataTypes.ENUM('public', 'draft'), defaultValue: 'public' },
  
  /** 
   * Cloudinary image key - Lưu trong cột 'image_url' của DB
   * Sử dụng field mapping để ánh xạ tên JS khác với tên cột DB
   */
  image_key: { type: DataTypes.STRING(500), allowNull: true, field: 'image_url' }
}, {
  tableName: 'posts',           // Tên bảng trong database
  timestamps: true,              // Tự động quản lý created_at và updated_at
  createdAt: 'created_at',       // Map createdAt sang snake_case
  updatedAt: 'updated_at'        // Map updatedAt sang snake_case
});

/**
 * Thiết lập quan hệ belongsTo với User
 * Mỗi Post thuộc về một User (author)
 * 
 * @relationship Post.belongsTo(User)
 * @foreignKey user_id
 * @alias author
 */
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

/**
 * Thiết lập quan hệ hasMany từ User đến Post
 * Một User có thể có nhiều Posts
 * 
 * @relationship User.hasMany(Post)
 * @foreignKey user_id
 * @alias posts
 */
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });

export default Post;
