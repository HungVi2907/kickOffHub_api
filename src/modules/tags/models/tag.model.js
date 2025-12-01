/**
 * @file Tag Model Definition
 * @description Sequelize model for the tags table. Tags are used to categorize
 * and organize forum posts for easier discovery and filtering.
 * @module modules/tags/models/tag
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

/**
 * Tag model representing a post tag/category.
 * @typedef {Object} Tag
 * @property {number} id - Auto-incremented primary key
 * @property {string} name - Unique tag name (max 50 characters)
 * @property {Date} created_at - Timestamp when the tag was created
 * @property {Date} updated_at - Timestamp when the tag was last updated
 */
const Tag = sequelize.define('Tag', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
}, {
  tableName: 'tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Tag;
