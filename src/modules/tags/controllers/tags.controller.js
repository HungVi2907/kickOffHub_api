import ApiResponse from '../../../common/response.js';
import toAppException from '../../../common/controllerError.js';
import * as TagsService from '../services/tags.service.js';

class TagsController {
  static async list(req, res, next) {
    try {
      const tags = await TagsService.listTags(req.query.q);
      return ApiResponse.success(res, tags, 'Tags retrieved');
    } catch (err) {
      next(toAppException(err, 'Error retrieving tags', 'TAGS_LIST_FAILED'));
    }
  }
}

export default TagsController;
