/**
 * @file PostReport Model Definition
 * @description Sequelize model for the post_reports table. Tracks user reports
 * on posts with optional reasons and status tracking for moderation.
 * @module modules/postReports/models/postReport
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';
import Post from '../../posts/models/post.model.js';
import User from '../../users/models/user.model.js';

/**
 * PostReport model representing a user's report on a post.
 * @typedef {Object} PostReport
 * @property {number} id - Auto-incremented primary key
 * @property {number} post_id - Foreign key referencing the reported post
 * @property {number} user_id - Foreign key referencing the reporting user
 * @property {string|null} reason - Optional explanation for the report (max 500 chars)
 * @property {string} status - Report status ('pending' or 'reviewed')
 * @property {Date} created_at - Timestamp when the report was created
 * @property {Date} updated_at - Timestamp when the report was last updated
 */
const PostReport = sequelize.define('PostReport', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  post_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.STRING(500), allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  tableName: 'post_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [{ unique: true, fields: ['post_id', 'user_id'] }],
});

PostReport.belongsTo(Post, { foreignKey: 'post_id', as: 'post', onDelete: 'CASCADE' });
PostReport.belongsTo(User, { foreignKey: 'user_id', as: 'reporter', onDelete: 'CASCADE' });
Post.hasMany(PostReport, { foreignKey: 'post_id', as: 'reports', onDelete: 'CASCADE' });
User.hasMany(PostReport, { foreignKey: 'user_id', as: 'postReports', onDelete: 'CASCADE' });

export default PostReport;
