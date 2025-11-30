import { Op, fn, col, literal } from 'sequelize';
import Tag from '../models/tag.model.js';

export async function findTagsWithPostCounts(searchTerm = '') {
  const normalized = searchTerm ? searchTerm.trim().toLowerCase() : '';
  const where = normalized ? { name: { [Op.like]: `%${normalized}%` } } : undefined;

  return Tag.findAll({
    attributes: ['id', 'name', [fn('COUNT', col('posts->PostTag.post_id')), 'postCount']],
    include: [{
      association: 'posts',
      attributes: [],
      through: { attributes: [] },
    }],
    where,
    group: ['Tag.id'],
    order: [[literal('postCount'), 'DESC'], ['name', 'ASC']],
  });
}
