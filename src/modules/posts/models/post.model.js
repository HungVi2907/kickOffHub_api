import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';
import User from '../../users/models/user.model.js';

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('public', 'draft'), defaultValue: 'public' },
  image_key: { type: DataTypes.STRING(500), allowNull: true, field: 'image_url' }
}, {
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });

export default Post;
