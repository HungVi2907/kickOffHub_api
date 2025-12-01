import {
  createImageUrl,
  buildPostImageKey,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from '../../../utils/cloudinaryMedia.js';
import { redisClient } from '../../../common/redisClient.js';
import {
  createPost,
  deletePost,
  findPaginatedPosts,
  findPostById,
  updatePost,
} from '../repositories/posts.repository.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const CACHE_TTL_SECONDS = Number.parseInt(process.env.POSTS_CACHE_TTL ?? '60', 10);

function buildCacheKey(page, limit) {
  return `posts:list:${page}:${limit}`;
}

async function mapPostToResponse(postInstance) {
  if (!postInstance) {
    return null;
  }

  const plain = postInstance.get({ plain: true });
  const { image_key: imageKey, ...rest } = plain;
  const imageUrl = createImageUrl(imageKey);

  return {
    ...rest,
    image_url: imageUrl,
  };
}

async function mapPostCollectionToResponse(collection) {
  const rows = await Promise.all(collection.rows.map(mapPostToResponse));
  return {
    total: collection.count,
    rows,
  };
}

async function invalidateCache() {
  if (!redisClient.isOpen) {
    return;
  }

  const keys = await redisClient.keys('posts:list:*');
  if (!keys.length) {
    return;
  }

  await redisClient.del(...keys);
}

export async function listPosts(pageRaw, limitRaw) {
  let page = Number.parseInt(pageRaw, 10);
  let limit = Number.parseInt(limitRaw, 10);

  if (!Number.isInteger(page) || page < 1) {
    page = DEFAULT_PAGE;
  }

  if (!Number.isInteger(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }

  limit = Math.min(limit, MAX_LIMIT);

  const cacheKey = buildCacheKey(page, limit);

  if (redisClient.isOpen) {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const collection = await findPaginatedPosts({ page, limit });
  const response = await mapPostCollectionToResponse(collection);
  const payload = {
    total: response.total,
    page,
    pageSize: limit,
    data: response.rows,
  };

  if (redisClient.isOpen && CACHE_TTL_SECONDS > 0) {
    await redisClient.set(cacheKey, JSON.stringify(payload), {
      EX: CACHE_TTL_SECONDS,
    });
  }

  return payload;
}

export async function getPostById(idRaw) {
  const id = Number.parseInt(idRaw, 10);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('INVALID_ID');
  }

  const post = await findPostById(id);
  return mapPostToResponse(post);
}

export async function createPostWithImage(userId, body, file) {
  const payload = {
    user_id: userId,
    title: body.title,
    content: body.content,
    status: body.status || 'public',
    tags: Array.isArray(body.tags) ? body.tags : undefined,
    image_key: null,
  };

  const post = await createPost(payload);

  if (file) {
    const key = buildPostImageKey(post.id, file.originalname || 'post.jpg');
    try {
      await uploadBufferToCloudinary(key, file.buffer, file.mimetype);
      post.image_key = key;
      await post.save();
    } catch (err) {
      await deletePost(post);
      throw err;
    }
  }

  await invalidateCache();
  const fullPost = await findPostById(post.id);
  return mapPostToResponse(fullPost);
}

export async function updatePostWithImage(postIdRaw, body, file) {
  const post = await findPostById(postIdRaw);
  if (!post) {
    return null;
  }

  const updates = {
    title: body.title ?? post.title,
    content: body.content ?? post.content,
    status: body.status ?? post.status,
    tags: Array.isArray(body.tags) ? body.tags : undefined,
  };

  let newImageKey = post.image_key;

  if (body.removeImage) {
    await deleteFromCloudinary(post.image_key);
    newImageKey = null;
  }

  if (file) {
    const key = buildPostImageKey(post.id, file.originalname || 'post.jpg');
    await uploadBufferToCloudinary(key, file.buffer, file.mimetype);
    if (newImageKey && newImageKey !== key) {
      await deleteFromCloudinary(newImageKey);
    }
    newImageKey = key;
  }

  updates.image_key = newImageKey;

  const updated = await updatePost(post, updates);
  await invalidateCache();
  const refreshed = await findPostById(updated.id);
  return mapPostToResponse(refreshed);
}

export async function removePost(postIdRaw) {
  const post = await findPostById(postIdRaw);
  if (!post) {
    return null;
  }

  if (post.image_key) {
    await deleteFromCloudinary(post.image_key);
  }

  await deletePost(post);
  await invalidateCache();
  return true;
}
