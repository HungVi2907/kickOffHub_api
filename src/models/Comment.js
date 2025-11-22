import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Post from './Post.js';

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  post_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });

export default Comment;