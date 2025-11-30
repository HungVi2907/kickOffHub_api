import ApiResponse from '../../../common/response.js';
import { AppException, NotFoundException, ValidationException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  createPostWithImage,
  getPostById,
  listPosts,
  removePost,
  updatePostWithImage,
} from '../services/posts.service.js';

function mapPostsError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (err instanceof AppException) {
    return err;
  }

  if (err?.message === 'INVALID_ID') {
    return new ValidationException('Post ID is invalid', 'POST_ID_INVALID');
  }

  return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
}

const PostsController = {
  async list(req, res, next) {
    try {
      const page = req.query.page;
      const limit = req.query.limit;
      const payload = await listPosts(page, limit);
      return ApiResponse.success(res, payload, 'Posts retrieved');
    } catch (err) {
      next(mapPostsError(err, 'Error retrieving posts', 'POSTS_LIST_FAILED'));
    }
  },

  async detail(req, res, next) {
    try {
      const post = await getPostById(req.params.id);
      if (!post) {
        throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
      }
      return ApiResponse.success(res, post, 'Post retrieved');
    } catch (err) {
      next(mapPostsError(err, 'Error retrieving post', 'POST_FETCH_FAILED'));
    }
  },

  async create(req, res, next) {
    try {
      const post = await createPostWithImage(req.user.id, req.body, req.file);
      return ApiResponse.created(res, post, 'Post created');
    } catch (err) {
      next(mapPostsError(err, 'Error creating post', 'POST_CREATE_FAILED'));
    }
  },

  async update(req, res, next) {
    try {
      const post = await updatePostWithImage(req.params.id, req.body, req.file);
      if (!post) {
        throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
      }
      return ApiResponse.success(res, post, 'Post updated');
    } catch (err) {
      next(mapPostsError(err, 'Error updating post', 'POST_UPDATE_FAILED'));
    }
  },

  async remove(req, res, next) {
    try {
      const deleted = await removePost(req.params.id);
      if (!deleted) {
        throw new NotFoundException('Post not found', 'POST_NOT_FOUND');
      }
      return ApiResponse.success(
        res,
        { id: Number.parseInt(req.params.id, 10) || req.params.id },
        'Post deleted',
      );
    } catch (err) {
      next(mapPostsError(err, 'Error deleting post', 'POST_DELETE_FAILED'));
    }
  },
};

export default PostsController;
