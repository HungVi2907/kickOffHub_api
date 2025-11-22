import { Op, fn, col, literal } from 'sequelize';
import Tag from '../models/Tag.js';
import Post from '../models/Post.js';

class TagsController {
  static async list(req, res) {
    try {
      const search = (req.query.q || '').toString().trim().toLowerCase();

      const tags = await Tag.findAll({
        attributes: [
          'id',
          'name',
          [fn('COUNT', col('posts->PostTag.post_id')), 'postCount']
        ],
        include: [{ model: Post, as: 'posts', attributes: [], through: { attributes: [] } }],
        where: search ? { name: { [Op.like]: `%${search}%` } } : undefined,
        group: ['Tag.id'],
        order: [[literal('postCount'), 'DESC'], ['name', 'ASC']]
      });

      res.json(tags);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách tags', details: err.message });
    }
  }
}

export default TagsController;
