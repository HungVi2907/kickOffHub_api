/**
 * @fileoverview Countries Controller - HTTP Request Handler
 * Controller layer xử lý các HTTP requests liên quan đến quốc gia.
 * 
 * Controller này chịu trách nhiệm:
 * - Nhận và parse request từ client
 * - Gọi service layer để xử lý business logic
 * - Format response trả về cho client
 * - Xử lý và chuyển đổi errors thành format chuẩn
 * 
 * @module modules/countries/controllers/countries.controller
 * @requires ../../../common/response.js
 * @requires ../../../common/exceptions/index.js
 * @requires ../../../common/controllerError.js
 * @requires ../services/countries.service.js
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import ApiResponse from '../../../common/response.js';
import { AppException } from '../../../common/exceptions/index.js';
import toAppException from '../../../common/controllerError.js';
import {
  CountryInputError,
  createCountry,
  deleteCountry,
  getCountryById,
  listCountries,
  searchCountriesByName,
  updateCountry,
} from '../services/countries.service.js';

/**
 * Chuyển đổi lỗi từ service layer thành AppException.
 * Xử lý đặc biệt cho CountryInputError để giữ nguyên error code và status.
 * 
 * @private
 * @function mapCountryError
 * @param {Error} error - Lỗi cần chuyển đổi
 * @param {string} fallbackMessage - Thông báo mặc định nếu không có message
 * @param {string} fallbackCode - Mã lỗi mặc định nếu không có code
 * @returns {AppException} Exception đã được chuẩn hóa
 */
function mapCountryError(error, fallbackMessage, fallbackCode) {
  // Nếu là CountryInputError, giữ nguyên thông tin lỗi từ service
  if (error instanceof CountryInputError) {
    return new AppException(error.message, error.code ?? fallbackCode, error.statusCode ?? 400);
  }
  // Các lỗi khác (database, network, etc.) dùng fallback
  return toAppException(error, fallbackMessage, fallbackCode);
}

/**
 * Countries Controller Object
 * Chứa các method xử lý HTTP requests cho resource countries.
 * 
 * @namespace CountriesController
 */
const CountriesController = {
  /**
   * Lấy danh sách quốc gia với phân trang.
   * 
   * @async
   * @function list
   * @memberof CountriesController
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {number|string} [req.query.page=1] - Số trang
   * @param {number|string} [req.query.limit=20] - Số bản ghi mỗi trang
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware
   * @returns {Promise<void>} Trả về response với danh sách quốc gia và pagination info
   * 
   * @example
   * // GET /api/countries?page=1&limit=10
   * // Response: { success: true, data: { data: [...], pagination: {...} } }
   */
  async list(req, res, next) {
    try {
      const payload = await listCountries({ page: req.query.page, limit: req.query.limit });
      return ApiResponse.success(res, payload, 'Countries retrieved');
    } catch (error) {
      next(mapCountryError(error, 'Error retrieving countries list', 'COUNTRIES_LIST_FAILED'));
    }
  },

  /**
   * Tìm kiếm quốc gia theo tên (case-insensitive).
   * 
   * @async
   * @function search
   * @memberof CountriesController
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.name - Từ khóa tìm kiếm (bắt buộc)
   * @param {number|string} [req.query.limit=20] - Số bản ghi mỗi trang
   * @param {number|string} [req.query.page=1] - Số trang
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware
   * @returns {Promise<void>} Trả về response với kết quả tìm kiếm
   * 
   * @example
   * // GET /api/countries/search?name=viet&limit=5
   * // Response: { success: true, data: { results: [...], pagination: {...}, keyword: 'viet' } }
   */
  async search(req, res, next) {
    try {
      const payload = await searchCountriesByName({
        name: req.query.name,
        limit: req.query.limit,
        page: req.query.page,
      });
      return ApiResponse.success(res, payload, 'Countries search results');
    } catch (error) {
      next(mapCountryError(error, 'Error searching countries by name', 'COUNTRIES_SEARCH_FAILED'));
    }
  },

  /**
   * Lấy thông tin chi tiết của một quốc gia theo ID.
   * 
   * @async
   * @function detail
   * @memberof CountriesController
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.params - URL parameters
   * @param {string} req.params.id - ID của quốc gia
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware
   * @returns {Promise<void>} Trả về response với thông tin quốc gia
   * 
   * @example
   * // GET /api/countries/1
   * // Response: { success: true, data: { id: 1, name: 'Vietnam', ... } }
   */
  async detail(req, res, next) {
    try {
      const country = await getCountryById(req.params.id);
      return ApiResponse.success(res, country, 'Country retrieved');
    } catch (error) {
      next(mapCountryError(error, 'Error retrieving country information', 'COUNTRY_FETCH_FAILED'));
    }
  },

  /**
   * Tạo mới một quốc gia (yêu cầu authentication).
   * 
   * @async
   * @function create
   * @memberof CountriesController
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.name - Tên quốc gia (bắt buộc)
   * @param {string} [req.body.code] - Mã ISO quốc gia
   * @param {string} [req.body.flag] - URL cờ quốc gia
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware
   * @returns {Promise<void>} Trả về response với quốc gia vừa tạo (status 201)
   * 
   * @example
   * // POST /api/countries
   * // Body: { name: 'Vietnam', code: 'VN', flag: 'https://...' }
   * // Response: { success: true, data: { id: 1, name: 'Vietnam', ... } }
   */
  async create(req, res, next) {
    try {
      const country = await createCountry(req.body);
      return ApiResponse.created(res, country, 'Country created');
    } catch (error) {
      next(mapCountryError(error, 'Error creating country', 'COUNTRY_CREATE_FAILED'));
    }
  },

  /**
   * Cập nhật thông tin quốc gia theo ID (yêu cầu authentication).
   * 
   * @async
   * @function update
   * @memberof CountriesController
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.params - URL parameters
   * @param {string} req.params.id - ID của quốc gia cần cập nhật
   * @param {Object} req.body - Request body với dữ liệu cập nhật
   * @param {string} req.body.name - Tên quốc gia mới (bắt buộc)
   * @param {string} [req.body.code] - Mã ISO mới
   * @param {string} [req.body.flag] - URL cờ mới
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware
   * @returns {Promise<void>} Trả về response với quốc gia sau khi cập nhật
   * 
   * @example
   * // PUT /api/countries/1
   * // Body: { name: 'Viet Nam', code: 'VNM' }
   */
  async update(req, res, next) {
    try {
      const country = await updateCountry(req.params.id, req.body);
      return ApiResponse.success(res, country, 'Country updated');
    } catch (error) {
      next(mapCountryError(error, 'Error updating country', 'COUNTRY_UPDATE_FAILED'));
    }
  },

  /**
   * Xóa một quốc gia theo ID (yêu cầu authentication).
   * 
   * @async
   * @function remove
   * @memberof CountriesController
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.params - URL parameters
   * @param {string} req.params.id - ID của quốc gia cần xóa
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next middleware
   * @returns {Promise<void>} Trả về response xác nhận đã xóa với ID của quốc gia
   * 
   * @example
   * // DELETE /api/countries/1
   * // Response: { success: true, data: { id: 1 }, message: 'Country deleted' }
   */
  async remove(req, res, next) {
    try {
      await deleteCountry(req.params.id);
      return ApiResponse.success(res, { id: Number.parseInt(req.params.id, 10) || req.params.id }, 'Country deleted');
    } catch (error) {
      next(mapCountryError(error, 'Error deleting country', 'COUNTRY_DELETE_FAILED'));
    }
  },
};

export default CountriesController;
