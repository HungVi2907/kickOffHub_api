import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Post from './Post.js';
import User from './User.js';

const PostLike = sequelize.define('PostLike', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  post_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'post_likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ unique: true, fields: ['post_id', 'user_id'] }]
});

PostLike.belongsTo(Post, { foreignKey: 'post_id', as: 'post', onDelete: 'CASCADE' });
PostLike.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
Post.hasMany(PostLike, { foreignKey: 'post_id', as: 'likes', onDelete: 'CASCADE' });
User.hasMany(PostLike, { foreignKey: 'user_id', as: 'postLikes', onDelete: 'CASCADE' });

export default PostLike;
