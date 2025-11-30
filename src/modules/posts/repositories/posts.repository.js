import { Op } from 'sequelize';
import sequelize from '../../../common/db.js';
import Post from '../models/post.model.js';
import User from '../../users/models/user.model.js';
import Comment from '../../comments/models/comment.model.js';
import Tag from '../../tags/models/tag.model.js';
import PostTag from '../models/postTag.model.js';

export async function findPaginatedPosts({ page, limit }) {
  const offset = (page - 1) * limit;

  return Post.findAndCountAll({
    include: [
      { model: User, as: 'author', attributes: ['id', 'username'] },
      { model: Tag, as: 'tags', through: { attributes: [] } }
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
}

export async function findPostById(id) {
  return Post.findByPk(id, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'username'] },
      { model: Tag, as: 'tags', through: { attributes: [] } },
      {
        model: Comment,
        as: 'comments',
        include: [{ model: User, as: 'author', attributes: ['id', 'username'] }]
      }
    ]
  });
}

export async function createPost(data) {
  return sequelize.transaction(async (transaction) => {
    const { tags, ...postData } = data;
    const post = await Post.create(postData, { transaction });

    if (tags?.length) {
      await syncPostTags(post.id, tags, transaction);
    }

    return post;
  });
}

export async function updatePost(post, data) {
  return sequelize.transaction(async (transaction) => {
    const { tags, ...updateData } = data;
    await post.update(updateData, { transaction });

    if (Array.isArray(tags)) {
      await syncPostTags(post.id, tags, transaction);
    }

    return post;
  });
}

export async function deletePost(post) {
  return sequelize.transaction(async (transaction) => {
    await PostTag.destroy({ where: { post_id: post.id }, transaction });
    await post.destroy({ transaction });
  });
}

export async function syncPostTags(postId, tags, transaction) {
  const normalized = Array.from(new Set(tags.map((tag) => String(tag).trim().toLowerCase()))).filter(Boolean);

  const existingTags = await Tag.findAll({
    where: { name: { [Op.in]: normalized } },
    transaction,
  });

  const existingByName = new Map(existingTags.map((tag) => [tag.name, tag]));

  const tagIds = [];

  for (const tagName of normalized) {
    const existing = existingByName.get(tagName);
    if (existing) {
      tagIds.push(existing.id);
      continue;
    }

    const created = await Tag.create({ name: tagName }, { transaction });
    tagIds.push(created.id);
  }

  await PostTag.destroy({ where: { post_id: postId }, transaction });

  if (tagIds.length) {
    await PostTag.bulkCreate(
      tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })),
      { transaction }
    );
  }
}
