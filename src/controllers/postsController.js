import { matchedData } from 'express-validator';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

class PostsController {
  static async list(req, res) {
    try {
      const posts = await Post.findAll({
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
        order: [['created_at', 'DESC']]
      });
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách bài viết', details: err.message });
    }
  }

  static async detail(req, res) {
    try {
      const postId = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(postId) || postId <= 0) {
        res.status(400).json({ error: 'ID bài viết không hợp lệ' });
        return;
      }

      const post = await Post.findByPk(postId, {
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
          {
            model: Comment,
            as: 'comments',
            include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
          }
        ],
        order: [[{ model: Comment, as: 'comments' }, 'created_at', 'ASC']]
      });

      if (!post) {
        res.status(404).json({ error: 'Bài viết không tồn tại' });
        return;
      }

      res.json(post);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi lấy chi tiết bài viết', details: err.message });
    }
  }

  static async create(req, res) {
    try {
      const data = matchedData(req, { locations: ['body'] });
      const post = await Post.create({
        user_id: req.user.id,
        title: data.title,
        content: data.content,
        status: data.status || 'public'
      });

      const fullPost = await Post.findByPk(post.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
      });
      res.status(201).json(fullPost);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi tạo bài viết', details: err.message });
    }
  }

  static async update(req, res) {
    try {
      const postId = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(postId) || postId <= 0) {
        res.status(400).json({ error: 'ID bài viết không hợp lệ' });
        return;
      }

      const post = await Post.findByPk(postId);
      if (!post) {
        res.status(404).json({ error: 'Bài viết không tồn tại' });
        return;
      }

      if (post.user_id !== req.user.id) {
        res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa bài viết này' });
        return;
      }

      const data = matchedData(req, { locations: ['body'] });
      if (!data.title && !data.content && !data.status) {
        res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
        return;
      }

      await post.update(data);
      const updatedPost = await Post.findByPk(postId, {
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
      });
      res.json(updatedPost);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi cập nhật bài viết', details: err.message });
    }
  }

  static async remove(req, res) {
    try {
      const postId = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(postId) || postId <= 0) {
        res.status(400).json({ error: 'ID bài viết không hợp lệ' });
        return;
      }

      const post = await Post.findByPk(postId);
      if (!post) {
        res.status(404).json({ error: 'Bài viết không tồn tại' });
        return;
      }

      if (post.user_id !== req.user.id) {
        res.status(403).json({ error: 'Bạn không có quyền xóa bài viết này' });
        return;
      }

      await post.destroy();
      res.json({ message: 'Đã xóa bài viết' });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi xóa bài viết', details: err.message });
    }
  }
}

export default PostsController;
