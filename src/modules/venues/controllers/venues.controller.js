import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  listVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  importVenuesFromApi,
} from '../services/venues.service.js';

function readRequestValue(req, key) {
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
    return req.body[key];
  }
  return req.query ? req.query[key] : undefined;
}

function mapVenuesError(err, fallbackMessage, fallbackCode, fallbackStatus = 500) {
  if (err instanceof AppException) {
    return err;
  }

  if (err?.code && err?.status) {
    return new AppException(err.message, err.code, err.status, err.details);
  }

  if (err?.code === 'ECONNABORTED') {
    return new AppException('Hết thời gian chờ khi gọi API-Football', 'API_FOOTBALL_TIMEOUT', 504);
  }

  if (typeof err?.code === 'string' && (err.code.startsWith('MISSING_') || err.code.startsWith('INVALID_'))) {
    return new AppException(err.message, err.code, 400, err.details);
  }

  if (err?.response && err.response.data) {
    const status = err.response.status || fallbackStatus;
    return new AppException(fallbackMessage, fallbackCode, status, { response: err.response.data });
  }

  return toAppException(err, fallbackMessage, fallbackCode, fallbackStatus);
}

const VenuesController = {
  async getAllVenues(_req, res, next) {
    try {
      const venues = await listVenues();
      return ApiResponse.success(res, venues, 'Venues retrieved');
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi lấy danh sách venues', 'VENUES_LIST_FAILED'));
    }
  },

  async getVenueById(req, res, next) {
    try {
      const venue = await getVenueById(req.params.id);
      return ApiResponse.success(res, venue, 'Venue retrieved');
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi lấy thông tin venue', 'VENUE_FETCH_FAILED'));
    }
  },

  async createVenue(req, res, next) {
    try {
      const venue = await createVenue(req.body);
      return ApiResponse.created(res, venue, 'Venue created');
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi tạo venue mới', 'VENUE_CREATE_FAILED'));
    }
  },

  async updateVenue(req, res, next) {
    try {
      const venue = await updateVenue(req.params.id, req.body);
      return ApiResponse.success(res, venue, 'Venue updated');
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi cập nhật venue', 'VENUE_UPDATE_FAILED'));
    }
  },

  async deleteVenue(req, res, next) {
    try {
      await deleteVenue(req.params.id);
      return ApiResponse.success(
        res,
        { id: Number.parseInt(req.params.id, 10) || req.params.id },
        'Venue đã được xóa thành công',
      );
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi xóa venue', 'VENUE_DELETE_FAILED'));
    }
  },

  async importVenuesFromApiFootball(req, res, next) {
    try {
      const payload = await importVenuesFromApi({ id: readRequestValue(req, 'id') });
      return ApiResponse.success(res, payload, 'Import venues thành công');
    } catch (err) {
      next(mapVenuesError(err, 'Lỗi khi import venues từ API Football', 'VENUE_IMPORT_FAILED'));
    }
  },
};

export default VenuesController;
