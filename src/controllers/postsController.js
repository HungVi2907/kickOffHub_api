import { matchedData } from 'express-validator';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Tag from '../models/Tag.js';
import PostLike from '../models/PostLike.js';
import PostReport from '../models/PostReport.js';
import { buildPublicImagePath } from '../middlewares/upload.js';
import fs from 'fs/promises';
import path from 'path';

const MAX_PAGE_SIZE = 50;
const ROOT_DIR = process.cwd();

async function removeImageFile(imageUrl) {
  if (!imageUrl) return;
  const relative = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  const absolutePath = path.join(ROOT_DIR, relative);
  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    // ignore if file already removed
  }
}

function enrichPostPayload(postJson, req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return {
    ...postJson,
    imageUrl: postJson.image_url ? `${baseUrl}${postJson.image_url}` : null,
  };
}

async function withLikeCount(postInstance) {
  const json = postInstance.toJSON();
  json.likeCount = await PostLike.count({ where: { post_id: postInstance.id } });
  return json;
}

async function syncTags(postInstance, tagNames = []) {
  if (!Array.isArray(tagNames)) {
    return;
  }

  const normalized = new Map();
  tagNames.forEach((raw) => {
    if (typeof raw !== 'string') return;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (!normalized.has(key)) {
      normalized.set(key, trimmed);
    }
  });

  const uniqueTags = [...normalized.values()];

  if (!uniqueTags.length) {
    await postInstance.setTags([]);
    return;
  }

  const tagRecords = await Promise.all(
    uniqueTags.map(async (value) => {
      const [tag] = await Tag.findOrCreate({ where: { name: value.toLowerCase() }, defaults: { name: value.toLowerCase() } });
      return tag;
    })
  );

  await postInstance.setTags(tagRecords);
}

class PostsController {
  static async list(req, res) {
    try {
      const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
      const pageSize = Math.min(Number.parseInt(req.query.limit, 10) || 10, MAX_PAGE_SIZE);
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Post.findAndCountAll({
        distinct: true,
        limit: pageSize,
        offset,
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
          { model: Tag, as: 'tags', through: { attributes: [] }, attributes: ['id', 'name'] }
        ],
        order: [['created_at', 'DESC']]
      });

      const data = await Promise.all(
        rows.map(async (post) => enrichPostPayload(await withLikeCount(post), req))
      );

      res.json({ page, pageSize, total: count, data });
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
          },
          { model: Tag, as: 'tags', through: { attributes: [] }, attributes: ['id', 'name'] }
        ],
        order: [[{ model: Comment, as: 'comments' }, 'created_at', 'ASC']]
      });

      if (!post) {
        res.status(404).json({ error: 'Bài viết không tồn tại' });
        return;
      }

      const payload = await withLikeCount(post);
      res.json(enrichPostPayload(payload, req));
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi lấy chi tiết bài viết', details: err.message });
    }
  }

  static async create(req, res) {
    try {
      const data = matchedData(req, { locations: ['body'], includeOptionals: true });
      const { tags = [], ...postData } = data;
      const imagePath = req.file ? buildPublicImagePath(req.file.filename) : null;

      const post = await Post.create({
        user_id: req.user.id,
        title: postData.title,
        content: postData.content,
        status: postData.status || 'public',
        image_url: imagePath
      });

      if (Array.isArray(tags) && tags.length) {
        await syncTags(post, tags);
      }

      const fullPost = await Post.findByPk(post.id, {
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
          { model: Tag, as: 'tags', through: { attributes: [] }, attributes: ['id', 'name'] }
        ]
      });

      const payload = await withLikeCount(fullPost);
      res.status(201).json(enrichPostPayload(payload, req));
    } catch (err) {
      if (req.file) {
        const uploadedPath = buildPublicImagePath(req.file.filename);
        await removeImageFile(uploadedPath);
      }
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

      const data = matchedData(req, { locations: ['body'], includeOptionals: true });
      const { tags, removeImage, ...updateData } = data;
      const oldImagePath = post.image_url;

      if (req.file) {
        updateData.image_url = buildPublicImagePath(req.file.filename);
      }

      if (removeImage === true && !req.file) {
        updateData.image_url = null;
      }

      if (!Object.keys(updateData).length && tags === undefined) {
        res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
        return;
      }

      if (Object.keys(updateData).length) {
        await post.update(updateData);
      }

      if (tags !== undefined) {
        await syncTags(post, tags);
      }

      if ((req.file || removeImage === true) && oldImagePath && oldImagePath !== updateData.image_url) {
        await removeImageFile(oldImagePath);
      }

      const updatedPost = await Post.findByPk(postId, {
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
          { model: Tag, as: 'tags', through: { attributes: [] }, attributes: ['id', 'name'] }
        ]
      });

      const payload = await withLikeCount(updatedPost);
      res.json(enrichPostPayload(payload, req));
    } catch (err) {
      if (req.file) {
        const uploadedPath = buildPublicImagePath(req.file.filename);
        await removeImageFile(uploadedPath);
      }
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

      const imagePath = post.image_url;
      await post.destroy();
      await removeImageFile(imagePath);
      res.json({ message: 'Đã xóa bài viết' });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi xóa bài viết', details: err.message });
    }
  }

  static async toggleLike(req, res) {
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

      const existingLike = await PostLike.findOne({ where: { post_id: postId, user_id: req.user.id } });
      let liked;

      if (existingLike) {
        await existingLike.destroy();
        liked = false;
      } else {
        await PostLike.create({ post_id: postId, user_id: req.user.id });
        liked = true;
      }

      const likeCount = await PostLike.count({ where: { post_id: postId } });
      res.json({ liked, likeCount });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi thao tác like bài viết', details: err.message });
    }
  }

  static async report(req, res) {
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

      const data = matchedData(req, { locations: ['body'], includeOptionals: true });

      try {
        await PostReport.create({
          post_id: postId,
          user_id: req.user.id,
          reason: data.reason || null
        });
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          res.status(409).json({ error: 'Bạn đã báo cáo bài viết này' });
          return;
        }
        throw error;
      }

      res.status(201).json({ message: 'Đã ghi nhận báo cáo' });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi báo cáo bài viết', details: err.message });
    }
  }
}

export default PostsController;
