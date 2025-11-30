import ApiResponse from '../../../common/response.js';
import {
  AppException,
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  createCommentForPost,
  removeCommentFromPost,
} from '../services/comments.service.js';

function mapCommentsError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (err instanceof AppException) {
    return err;
  }

  switch (err?.message) {
    case 'INVALID_POST_ID':
    case 'INVALID_COMMENT_ID':
    case 'INVALID_USER_ID':
      return new ValidationException('Invalid identifier', fallbackCode);
    case 'POST_NOT_FOUND':
    case 'COMMENT_NOT_FOUND':
      return new NotFoundException('Comment resource not found', fallbackCode);
    case 'NOT_ALLOWED':
      return new ForbiddenException('You cannot remove this comment', fallbackCode);
    default:
      return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
  }
}

const CommentsController = {
  async create(req, res, next) {
    try {
      const comment = await createCommentForPost(req.params.postId, req.user.id, req.body.content);
      return ApiResponse.created(res, comment, 'Comment created');
    } catch (err) {
      next(mapCommentsError(err, 'Unable to create comment', 'COMMENT_CREATE_FAILED'));
    }
  },

  async remove(req, res, next) {
    try {
      await removeCommentFromPost(req.params.postId, req.params.commentId, req.user.id);
      return ApiResponse.success(
        res,
        {
          postId: Number.parseInt(req.params.postId, 10) || req.params.postId,
          commentId: Number.parseInt(req.params.commentId, 10) || req.params.commentId,
        },
        'Comment removed',
      );
    } catch (err) {
      next(mapCommentsError(err, 'Unable to remove comment', 'COMMENT_DELETE_FAILED'));
    }
  },
};

export default CommentsController;
