import ApiResponse from '../../../common/response.js';
import toAppException from '../../../common/controllerError.js';
import {
  createLeague,
  fetchLeagueById,
  listLeagues,
  removeLeague,
  searchLeagues,
  updateLeague,
} from '../services/leagues.service.js';

class LeaguesController {
  static async list(req, res, next) {
    try {
      const leagues = await listLeagues();
      return ApiResponse.success(res, leagues, 'Leagues retrieved');
    } catch (err) {
      next(toAppException(err, 'Error retrieving leagues', 'LEAGUES_LIST_FAILED'));
    }
  }

  static async detail(req, res, next) {
    try {
      const league = await fetchLeagueById(req.params.id);
      return ApiResponse.success(res, league, 'League retrieved');
    } catch (err) {
      next(toAppException(err, 'Error retrieving league', 'LEAGUE_FETCH_FAILED'));
    }
  }

  static async create(req, res, next) {
    try {
      const payload = await createLeague(req.body);
      return ApiResponse.created(res, payload, 'League created');
    } catch (err) {
      next(toAppException(err, 'Error creating league', 'LEAGUE_CREATE_FAILED'));
    }
  }

  static async update(req, res, next) {
    try {
      const payload = await updateLeague(req.params.id, req.body);
      return ApiResponse.success(res, payload, 'League updated');
    } catch (err) {
      next(toAppException(err, 'Error updating league', 'LEAGUE_UPDATE_FAILED'));
    }
  }

  static async remove(req, res, next) {
    try {
      await removeLeague(req.params.id);
      return ApiResponse.success(
        res,
        { id: Number.parseInt(req.params.id, 10) || req.params.id },
        'League deleted',
      );
    } catch (err) {
      next(toAppException(err, 'Error deleting league', 'LEAGUE_DELETE_FAILED'));
    }
  }

  static async search(req, res, next) {
    try {
      const results = await searchLeagues(req.query.name, {
        limit: req.query.limit,
        page: req.query.page,
      });
      return ApiResponse.success(res, results, 'Leagues search results');
    } catch (err) {
      next(toAppException(err, 'Error searching leagues', 'LEAGUES_SEARCH_FAILED'));
    }
  }
}

export default LeaguesController;
