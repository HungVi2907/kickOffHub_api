import { Op } from 'sequelize';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Tag from '../models/Tag.js';
import PostTag from '../models/PostTag.js';

const PostsController = {

  // ================= LIST POSTS ==================
  async list(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const posts = await Post.findAndCountAll({
        include: [
          { model: User, as: 'author', attributes: ['id', 'username'] },
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      return res.json({
        total: posts.count,
        page,
        pageSize: limit,
        data: posts.rows
      });

    } catch (err) {
      console.error("❌ ERROR LIST POSTS:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },


  // ================= DETAIL ==================
  async detail(req, res) {
    try {
      const { id } = req.params;

      const post = await Post.findByPk(id, {
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

      if (!post) return res.status(404).json({ error: "Post not found" });

      return res.json(post);

    } catch (err) {
      console.error("❌ ERROR DETAIL:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },


  // ================= CREATE POST ==================
  async create(req, res) {
    try {
      console.log("🟦 BODY:", req.body);
      console.log("🟩 FILE:", req.file);

      const newPost = await Post.create({
        user_id: req.user.id,
        title: req.body.title,
        content: req.body.content,
        status: req.body.status || 'public',
        image_url: req.file ? req.file.path : null,
      });

      // ======== ADD TAGS ========
      if (Array.isArray(req.body.tags) && req.body.tags.length > 0) {
        for (const t of req.body.tags) {
          let [tag] = await Tag.findOrCreate({
            where: { name: t.trim().toLowerCase() }
          });
          await PostTag.create({ post_id: newPost.id, tag_id: tag.id });
        }
      }

      return res.status(201).json(newPost);

    } catch (err) {
      console.error("❌ ERROR CREATE POST:", err);
      return res.status(500).json({
        error: "Internal Server Error",
        detail: err.message
      });
    }
  },


  // ================= UPDATE POST ==================
  async update(req, res) {
    try {
      const { id } = req.params;

      const post = await Post.findByPk(id);
      if (!post) return res.status(404).json({ error: "Post not found" });

      await post.update({
        title: req.body.title ?? post.title,
        content: req.body.content ?? post.content,
        status: req.body.status ?? post.status,
        image_url: req.file ? req.file.path : post.image_url,
      });

      return res.json(post);

    } catch (err) {
      console.error("❌ ERROR UPDATE POST:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },


  // ================= DELETE POST ==================
  async remove(req, res) {
    try {
      const { id } = req.params;

      const post = await Post.findByPk(id);
      if (!post) return res.status(404).json({ error: "Post not found" });

      await post.destroy();

      return res.json({ message: "Deleted successfully" });

    } catch (err) {
      console.error("❌ ERROR DELETE POST:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },


  // ================= LIKE / UNLIKE ==================
  async toggleLike(req, res) {
    try {
      return res.json({ message: "This endpoint will be implemented later" });

    } catch (err) {
      console.error("❌ ERROR TOGGLE LIKE:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },


  // ================= REPORT ==================
  async report(req, res) {
    try {
      return res.json({ message: "Report received" });

    } catch (err) {
      console.error("❌ ERROR REPORT:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

};

export default PostsController;
