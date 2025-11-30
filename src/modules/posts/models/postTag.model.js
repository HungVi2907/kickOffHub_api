import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';
import Post from './post.model.js';
import Tag from '../../tags/models/tag.model.js';

const PostTag = sequelize.define('PostTag', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  post_id: { type: DataTypes.INTEGER, allowNull: false },
  tag_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'post_tags',
  timestamps: false,
  indexes: [{ unique: true, fields: ['post_id', 'tag_id'] }],
});

Post.belongsToMany(Tag, { through: PostTag, foreignKey: 'post_id', otherKey: 'tag_id', as: 'tags' });
Tag.belongsToMany(Post, { through: PostTag, foreignKey: 'tag_id', otherKey: 'post_id', as: 'posts' });

export default PostTag;
