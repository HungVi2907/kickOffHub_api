import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import { getLikeSummary, toggleLike } from '../services/postLikes.service.js';

function mapPostLikesError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (err instanceof AppException) {
    return err;
  }

  if (err?.statusCode || err?.status) {
    return new AppException(err.message, err.code || fallbackCode, err.statusCode || err.status, err.details);
  }

  return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
}

class PostLikesController {
  static async toggle(req, res, next) {
    try {
      const result = await toggleLike(req.params.id, req.user?.id);
      return ApiResponse.success(res, result, 'Post like toggled');
    } catch (err) {
      next(mapPostLikesError(err, 'Unable to toggle like', 'POST_LIKE_TOGGLE_FAILED'));
    }
  }

  static async summary(req, res, next) {
    try {
      const result = await getLikeSummary(req.params.id, req.user?.id);
      return ApiResponse.success(res, result, 'Post like summary');
    } catch (err) {
      next(mapPostLikesError(err, 'Unable to retrieve like summary', 'POST_LIKE_SUMMARY_FAILED'));
    }
  }
}

export default PostLikesController;
