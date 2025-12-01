/**
 * @file PostLike Model Definition
 * @description Sequelize model for the post_likes table. Tracks which users
 * have liked which posts, enforcing a unique constraint per user-post pair.
 * @module modules/postLikes/models/postLike
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';
import Post from '../../posts/models/post.model.js';
import User from '../../users/models/user.model.js';

/**
 * PostLike model representing a user's like on a post.
 * @typedef {Object} PostLike
 * @property {number} id - Auto-incremented primary key
 * @property {number} post_id - Foreign key referencing the liked post
 * @property {number} user_id - Foreign key referencing the user who liked
 * @property {Date} created_at - Timestamp when the like was created
 */
const PostLike = sequelize.define('PostLike', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  post_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'post_likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ unique: true, fields: ['post_id', 'user_id'] }],
});

PostLike.belongsTo(Post, { foreignKey: 'post_id', as: 'post', onDelete: 'CASCADE' });
PostLike.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
Post.hasMany(PostLike, { foreignKey: 'post_id', as: 'likes', onDelete: 'CASCADE' });
User.hasMany(PostLike, { foreignKey: 'user_id', as: 'postLikes', onDelete: 'CASCADE' });

export default PostLike;
