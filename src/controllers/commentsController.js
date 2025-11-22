import { matchedData } from 'express-validator';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

class CommentsController {
  static async create(req, res) {
    try {
      const postId = Number.parseInt(req.params.postId, 10);
      if (!Number.isInteger(postId) || postId <= 0) {
        res.status(400).json({ error: 'ID bài viết không hợp lệ' });
        return;
      }

      const post = await Post.findByPk(postId);
      if (!post) {
        res.status(404).json({ error: 'Bài viết không tồn tại' });
        return;
      }

      const data = matchedData(req, { locations: ['body'] });
      const comment = await Comment.create({
        post_id: postId,
        user_id: req.user.id,
        content: data.content
      });

      const fullComment = await Comment.findByPk(comment.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
      });
      res.status(201).json(fullComment);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi tạo bình luận', details: err.message });
    }
  }

  static async remove(req, res) {
    try {
      const postId = Number.parseInt(req.params.postId, 10);
      const commentId = Number.parseInt(req.params.commentId, 10);
      if (!Number.isInteger(postId) || postId <= 0 || !Number.isInteger(commentId) || commentId <= 0) {
        res.status(400).json({ error: 'ID không hợp lệ' });
        return;
      }

      const comment = await Comment.findOne({ where: { id: commentId, post_id: postId } });
      if (!comment) {
        res.status(404).json({ error: 'Bình luận không tồn tại' });
        return;
      }

      if (comment.user_id !== req.user.id) {
        res.status(403).json({ error: 'Bạn không có quyền xóa bình luận này' });
        return;
      }

      await comment.destroy();
      res.json({ message: 'Đã xóa bình luận' });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi xóa bình luận', details: err.message });
    }
  }
}

export default CommentsController;
