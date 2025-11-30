import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import { reportPost } from '../services/postReports.service.js';

function mapPostReportsError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (err instanceof AppException) {
    return err;
  }

  if (err?.statusCode || err?.status) {
    return new AppException(err.message, err.code || fallbackCode, err.statusCode ?? err.status ?? 400, err.details);
  }

  return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
}

class PostReportsController {
  static async report(req, res, next) {
    try {
      const result = await reportPost(req.params.id, req.user?.id, req.body.reason);
      return ApiResponse.created(res, result, 'Report received');
    } catch (err) {
      next(mapPostReportsError(err, 'Unable to report post', 'POST_REPORT_FAILED'));
    }
  }
}

export default PostReportsController;
