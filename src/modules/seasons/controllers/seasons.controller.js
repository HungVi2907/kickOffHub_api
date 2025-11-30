import ApiResponse from '../../../common/response.js';
import toAppException from '../../../common/controllerError.js';
import {
  createSeasonEntry,
  listSeasons,
  removeSeason,
} from '../services/seasons.service.js';

class SeasonsController {
  static async list(req, res, next) {
    try {
      const seasons = await listSeasons();
      return ApiResponse.success(res, seasons, 'Seasons retrieved');
    } catch (err) {
      next(toAppException(err, 'Error retrieving seasons', 'SEASONS_LIST_FAILED'));
    }
  }

  static async create(req, res, next) {
    try {
      const { season, created } = await createSeasonEntry(req.body);
      const message = created ? 'Season created' : 'Season already exists';
      const status = created ? 201 : 200;
      return ApiResponse.success(res, season, message, status);
    } catch (err) {
      next(toAppException(err, 'Error creating season', 'SEASON_CREATE_FAILED'));
    }
  }

  static async remove(req, res, next) {
    try {
      await removeSeason(req.params.season);
      return ApiResponse.success(
        res,
        { season: Number.parseInt(req.params.season, 10) || req.params.season },
        'Season đã được xóa thành công',
      );
    } catch (err) {
      next(toAppException(err, 'Error deleting season', 'SEASON_DELETE_FAILED'));
    }
  }
}

export default SeasonsController;
