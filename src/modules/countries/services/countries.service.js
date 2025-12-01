/**
 * @fileoverview Countries Service - Business Logic Layer
 * Service layer chứa toàn bộ business logic cho việc quản lý quốc gia.
 * 
 * Service này cung cấp các chức năng:
 * - Liệt kê danh sách quốc gia với phân trang
 * - Tìm kiếm quốc gia theo tên (case-insensitive)
 * - Lấy chi tiết quốc gia theo ID
 * - Tạo mới quốc gia
 * - Cập nhật thông tin quốc gia
 * - Xóa quốc gia
 * 
 * @module modules/countries/services/countries.service
 * @requires sequelize
 * @requires ../models/country.model.js
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { Op, fn, col, where } from 'sequelize';
import Country from '../models/country.model.js';

/**
 * Danh sách các thuộc tính được phép trả về cho client.
 * Giới hạn fields để bảo mật và tối ưu bandwidth.
 * @constant {string[]}
 */
export const COUNTRY_ATTRIBUTES = ['id', 'name', 'code', 'flag', 'is_popular'];

/**
 * Giá trị mặc định cho trang (pagination)
 * @constant {number}
 */
const DEFAULT_PAGE = 1;

/**
 * Số lượng bản ghi mặc định mỗi trang
 * @constant {number}
 */
const DEFAULT_LIMIT = 20;

/**
 * Số lượng bản ghi tối đa cho phép mỗi trang (tránh quá tải server)
 * Countries table is small, so allow fetching all at once
 * @constant {number}
 */
const MAX_LIMIT = 300;

/**
 * Custom Error class cho các lỗi validation input của Country.
 * Kế thừa từ Error để hỗ trợ stack trace và instanceof check.
 * 
 * @class CountryInputError
 * @extends Error
 * 
 * @example
 * throw new CountryInputError('INVALID_ID', 'Country Id is not valid', 400);
 */
export class CountryInputError extends Error {
  /**
   * Tạo một instance CountryInputError mới.
   * @param {string} code - Mã lỗi để frontend xử lý (ví dụ: 'INVALID_ID', 'NOT_FOUND')
   * @param {string} message - Thông báo lỗi chi tiết cho người dùng
   * @param {number} [statusCode=400] - HTTP status code tương ứng
   */
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = 'CountryInputError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Factory function tạo CountryInputError.
 * Giúp code ngắn gọn hơn khi throw error.
 * 
 * @private
 * @param {string} code - Mã lỗi
 * @param {string} message - Thông báo lỗi
 * @param {number} [statusCode=400] - HTTP status code
 * @returns {CountryInputError} Instance của CountryInputError
 */
const createInputError = (code, message, statusCode = 400) =>
  new CountryInputError(code, message, statusCode);

/**
 * Parse và validate giá trị thành số nguyên dương.
 * Sử dụng cho việc validate các tham số pagination (page, limit).
 * 
 * @function parsePositiveIntOrDefault
 * @param {*} value - Giá trị cần parse (có thể là string, number, undefined, null)
 * @param {number} defaultValue - Giá trị mặc định nếu value không hợp lệ hoặc rỗng
 * @returns {number|null} Số nguyên dương đã parse, defaultValue nếu rỗng, hoặc null nếu không hợp lệ
 * 
 * @example
 * parsePositiveIntOrDefault('5', 1);      // Returns: 5
 * parsePositiveIntOrDefault(undefined, 1); // Returns: 1
 * parsePositiveIntOrDefault('abc', 1);     // Returns: null
 * parsePositiveIntOrDefault(-1, 1);        // Returns: null
 */
export function parsePositiveIntOrDefault(value, defaultValue) {
  // Trường hợp không có giá trị, trả về default
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  // Chuyển về string và trim khoảng trắng
  const trimmed = String(value).trim();
  if (trimmed === '') {
    return defaultValue;
  }
  
  // Parse thành số nguyên base 10
  const parsed = Number.parseInt(trimmed, 10);
  
  // Validate: phải là số nguyên dương (>= 1)
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

/**
 * Lấy danh sách quốc gia với hỗ trợ phân trang.
 * Danh sách được sắp xếp theo tên quốc gia theo thứ tự A-Z.
 * 
 * @async
 * @function listCountries
 * @param {Object} [options={}] - Tùy chọn phân trang
 * @param {number|string} [options.page=1] - Số trang (bắt đầu từ 1)
 * @param {number|string} [options.limit=20] - Số bản ghi mỗi trang (tối đa 100)
 * @returns {Promise<Object>} Kết quả phân trang
 * @returns {Array<Object>} returns.data - Mảng các quốc gia
 * @returns {Object} returns.pagination - Thông tin phân trang
 * @returns {number} returns.pagination.totalItems - Tổng số quốc gia
 * @returns {number} returns.pagination.totalPages - Tổng số trang
 * @returns {number} returns.pagination.page - Trang hiện tại
 * @returns {number} returns.pagination.limit - Số bản ghi mỗi trang
 * @returns {boolean} returns.pagination.hasNextPage - Có trang tiếp theo không
 * @returns {boolean} returns.pagination.hasPrevPage - Có trang trước không
 * @throws {CountryInputError} Nếu page không phải số nguyên dương (code: INVALID_PAGE)
 * @throws {CountryInputError} Nếu limit không phải số nguyên dương (code: INVALID_LIMIT)
 * @throws {CountryInputError} Nếu limit vượt quá MAX_LIMIT (code: LIMIT_TOO_LARGE)
 * @throws {CountryInputError} Nếu page vượt quá tổng số trang (code: PAGE_OUT_OF_RANGE)
 * 
 * @example
 * const result = await listCountries({ page: 1, limit: 10 });
 * console.log(result.data); // Array of countries
 * console.log(result.pagination.totalItems); // Total count
 */
export async function listCountries({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) {
  // Validate và parse tham số page - fallback to default if invalid
  let pageNumber = parsePositiveIntOrDefault(page, DEFAULT_PAGE);
  if (pageNumber === null) {
    pageNumber = DEFAULT_PAGE; // Fallback instead of throwing error
  }

  // Validate và parse tham số limit - fallback to default if invalid
  let limitNumber = parsePositiveIntOrDefault(limit, DEFAULT_LIMIT);
  if (limitNumber === null) {
    limitNumber = DEFAULT_LIMIT; // Fallback instead of throwing error
  }
  
  // Cap limit to MAX_LIMIT instead of throwing error
  if (limitNumber > MAX_LIMIT) {
    limitNumber = MAX_LIMIT;
  }

  // Tính offset cho query (vị trí bắt đầu lấy dữ liệu)
  const offset = (pageNumber - 1) * limitNumber;

  // Query database với pagination
  const { rows, count } = await Country.findAndCountAll({
    attributes: COUNTRY_ATTRIBUTES,
    order: [['name', 'ASC']], // Sắp xếp theo tên A-Z
    limit: limitNumber,
    offset,
  });
  
  // Tính tổng số trang
  const totalPages = Math.ceil(count / limitNumber);
  
  // Kiểm tra page có vượt quá tổng số trang không
  if (totalPages !== 0 && pageNumber > totalPages) {
    throw createInputError('PAGE_OUT_OF_RANGE', 'Page exceeds total pages');
  }

  return {
    data: rows,
    pagination: {
      totalItems: count,
      totalPages,
      page: pageNumber,
      limit: limitNumber,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
  };
}

/**
 * Tìm kiếm quốc gia theo tên với hỗ trợ phân trang.
 * Tìm kiếm không phân biệt hoa thường (case-insensitive) sử dụng LIKE pattern.
 * 
 * @async
 * @function searchCountriesByName
 * @param {Object} [options={}] - Tùy chọn tìm kiếm
 * @param {string} options.name - Từ khóa tìm kiếm (bắt buộc)
 * @param {number|string} [options.limit=20] - Số bản ghi mỗi trang
 * @param {number|string} [options.page=1] - Số trang
 * @returns {Promise<Object>} Kết quả tìm kiếm
 * @returns {Array<Object>} returns.results - Mảng các quốc gia tìm được
 * @returns {Object} returns.pagination - Thông tin phân trang
 * @returns {string} returns.keyword - Từ khóa đã tìm kiếm (sau khi trim)
 * @throws {CountryInputError} Nếu name rỗng hoặc không có (code: NAME_REQUIRED)
 * @throws {CountryInputError} Nếu limit không hợp lệ (code: INVALID_LIMIT)
 * @throws {CountryInputError} Nếu page không hợp lệ (code: INVALID_PAGE)
 * 
 * @example
 * const result = await searchCountriesByName({ name: 'viet', limit: 10 });
 * // Có thể tìm thấy: Vietnam, Soviet Union, etc.
 */
export async function searchCountriesByName({ name, limit = DEFAULT_LIMIT, page = DEFAULT_PAGE } = {}) {
  // Validate và chuẩn hóa từ khóa tìm kiếm
  const keywordRaw = typeof name === 'string' ? name.trim() : '';
  if (!keywordRaw) {
    throw createInputError('NAME_REQUIRED', 'Country name is required');
  }

  // Validate tham số limit
  const limitNumber = parsePositiveIntOrDefault(limit, DEFAULT_LIMIT);
  if (limitNumber === null) {
    throw createInputError('INVALID_LIMIT', 'limit must be a positive integer');
  }

  // Validate tham số page
  const pageNumber = parsePositiveIntOrDefault(page, DEFAULT_PAGE);
  if (pageNumber === null) {
    throw createInputError('INVALID_PAGE', 'page must be a positive integer');
  }

  // Tính offset cho pagination
  const offset = (pageNumber - 1) * limitNumber;
  
  // Chuẩn hóa keyword cho tìm kiếm case-insensitive
  const keywordLower = keywordRaw.toLowerCase();
  
  // Escape các ký tự đặc biệt trong LIKE pattern (% và _)
  // Tránh SQL injection và đảm bảo tìm kiếm chính xác
  const escapedKeyword = keywordLower.replace(/[%_]/g, '\\$&');
  const likePattern = `%${escapedKeyword}%`;

  // Query với LIKE pattern, sử dụng LOWER() để case-insensitive
  const { rows: countries, count: totalItems } = await Country.findAndCountAll({
    attributes: COUNTRY_ATTRIBUTES,
    where: where(fn('LOWER', col('name')), { [Op.like]: likePattern }),
    order: [['name', 'ASC']],
    limit: limitNumber,
    offset,
    escape: '\\', // Ký tự escape cho LIKE pattern
  });

  // Tính tổng số trang
  const totalPages = Math.ceil(totalItems / limitNumber);

  return {
    results: countries,
    pagination: {
      totalItems,
      totalPages,
      page: pageNumber,
      limit: limitNumber,
    },
    keyword: keywordRaw, // Trả về keyword gốc (đã trim) để frontend hiển thị
  };
}

/**
 * Lấy thông tin chi tiết của một quốc gia theo ID.
 * 
 * @async
 * @function getCountryById
 * @param {number|string} id - ID của quốc gia cần lấy
 * @returns {Promise<Object>} Thông tin quốc gia với các fields trong COUNTRY_ATTRIBUTES
 * @throws {CountryInputError} Nếu ID không phải số nguyên dương (code: INVALID_ID)
 * @throws {CountryInputError} Nếu không tìm thấy quốc gia (code: NOT_FOUND, status: 404)
 * 
 * @example
 * const country = await getCountryById(1);
 * console.log(country.name); // 'Vietnam'
 */
export async function getCountryById(id) {
  // Parse và validate ID
  const countryId = Number.parseInt(id, 10);
  if (!Number.isInteger(countryId) || countryId <= 0) {
    throw createInputError('INVALID_ID', 'Country Id is not valid');
  }

  // Query quốc gia theo primary key
  const country = await Country.findByPk(countryId, { attributes: COUNTRY_ATTRIBUTES });
  
  // Kiểm tra quốc gia có tồn tại không
  if (!country) {
    throw createInputError('NOT_FOUND', 'Country does not exist', 404);
  }
  return country;
}

/**
 * Tạo mới một quốc gia trong hệ thống.
 * 
 * @async
 * @function createCountry
 * @param {Object} [payload={}] - Dữ liệu quốc gia mới
 * @param {string} payload.name - Tên quốc gia (bắt buộc, phải unique)
 * @param {string} [payload.code] - Mã ISO quốc gia (ví dụ: 'VN', 'ENG')
 * @param {string} [payload.flag] - URL hình ảnh cờ quốc gia
 * @returns {Promise<Object>} Quốc gia vừa được tạo
 * @throws {CountryInputError} Nếu name không được cung cấp (code: NAME_REQUIRED)
 * @throws {Error} Nếu name đã tồn tại (Sequelize UniqueConstraintError)
 * 
 * @example
 * const newCountry = await createCountry({
 *   name: 'Vietnam',
 *   code: 'VN',
 *   flag: 'https://example.com/flags/vn.png'
 * });
 */
export async function createCountry(payload = {}) {
  const { name, code, flag, is_popular } = payload;
  
  // Validate name là bắt buộc
  if (!name) {
    throw createInputError('NAME_REQUIRED', 'Name is required');
  }

  // Validate name length
  if (name.length > 255) {
    throw createInputError('NAME_TOO_LONG', 'Name cannot exceed 255 characters');
  }

  // Validate code length if provided
  if (code && code.length > 10) {
    throw createInputError('CODE_TOO_LONG', 'Code cannot exceed 10 characters');
  }

  // Validate flag URL if provided
  if (flag && flag.length > 255) {
    throw createInputError('FLAG_TOO_LONG', 'Flag URL cannot exceed 255 characters');
  }

  // Validate is_popular is boolean if provided
  const isPopularValue = is_popular === true || is_popular === 1 || is_popular === '1' || is_popular === 'true';
  
  // Tạo mới quốc gia trong database
  const country = await Country.create({ name, code, flag, is_popular: isPopularValue });
  return country;
}

/**
 * Cập nhật thông tin quốc gia theo ID.
 * 
 * @async
 * @function updateCountry
 * @param {number|string} id - ID của quốc gia cần cập nhật
 * @param {Object} [payload={}] - Dữ liệu cập nhật
 * @param {string} payload.name - Tên quốc gia mới (bắt buộc)
 * @param {string} [payload.code] - Mã ISO quốc gia mới
 * @param {string} [payload.flag] - URL cờ quốc gia mới
 * @returns {Promise<Object>} Quốc gia sau khi cập nhật
 * @throws {CountryInputError} Nếu ID không hợp lệ (code: INVALID_ID)
 * @throws {CountryInputError} Nếu name không được cung cấp (code: NAME_REQUIRED)
 * @throws {CountryInputError} Nếu không tìm thấy quốc gia (code: NOT_FOUND, status: 404)
 * 
 * @example
 * const updated = await updateCountry(1, { name: 'Viet Nam', code: 'VNM' });
 */
export async function updateCountry(id, payload = {}) {
  // Parse và validate ID
  const countryId = Number.parseInt(id, 10);
  if (!Number.isInteger(countryId) || countryId <= 0) {
    throw createInputError('INVALID_ID', 'Country Id is not valid');
  }

  const { name, code, flag, is_popular } = payload;
  
  // Validate name là bắt buộc
  if (!name) {
    throw createInputError('NAME_REQUIRED', 'Name is required');
  }

  // Validate name length
  if (name.length > 255) {
    throw createInputError('NAME_TOO_LONG', 'Name cannot exceed 255 characters');
  }

  // Validate code length if provided
  if (code && code.length > 10) {
    throw createInputError('CODE_TOO_LONG', 'Code cannot exceed 10 characters');
  }

  // Validate flag URL if provided
  if (flag && flag.length > 255) {
    throw createInputError('FLAG_TOO_LONG', 'Flag URL cannot exceed 255 characters');
  }

  // Build update data
  const updateData = { name, code, flag };
  
  // Only update is_popular if explicitly provided
  if (is_popular !== undefined) {
    updateData.is_popular = is_popular === true || is_popular === 1 || is_popular === '1' || is_popular === 'true';
  }

  // Thực hiện update và kiểm tra số bản ghi bị ảnh hưởng
  const [updated] = await Country.update(
    updateData,
    { where: { id: countryId } },
  );
  
  // Nếu không có bản ghi nào được update, nghĩa là ID không tồn tại
  if (updated === 0) {
    throw createInputError('NOT_FOUND', 'Country does not exist', 404);
  }
  
  // Trả về quốc gia sau khi update
  return Country.findByPk(countryId, { attributes: COUNTRY_ATTRIBUTES });
}

/**
 * Lấy danh sách các quốc gia nổi bật (is_popular = true).
 * Danh sách được sắp xếp theo tên quốc gia theo thứ tự A-Z.
 * 
 * @async
 * @function listPopularCountries
 * @returns {Promise<Object>} Kết quả với danh sách quốc gia nổi bật
 * @returns {Array<Object>} returns.data - Mảng các quốc gia nổi bật
 * @returns {number} returns.total - Tổng số quốc gia nổi bật
 * 
 * @example
 * const result = await listPopularCountries();
 * console.log(result.data); // Array of popular countries
 * console.log(result.total); // Total count
 */
export async function listPopularCountries() {
  const { rows, count } = await Country.findAndCountAll({
    attributes: COUNTRY_ATTRIBUTES,
    where: { is_popular: true },
    order: [['name', 'ASC']],
  });

  return {
    data: rows,
    total: count,
  };
}

/**
 * Get the total count of countries in the database.
 * 
 * @async
 * @function getCountriesCount
 * @returns {Promise<Object>} Object containing total count
 * @returns {number} returns.total - Total number of countries
 * 
 * @example
 * const result = await getCountriesCount();
 * console.log(result.total); // 195
 */
export async function getCountriesCount() {
  const total = await Country.count();
  return { total };
}

/**
 * Xóa một quốc gia khỏi hệ thống theo ID.
 * 
 * @async
 * @function deleteCountry
 * @param {number|string} id - ID của quốc gia cần xóa
 * @returns {Promise<boolean>} true nếu xóa thành công
 * @throws {CountryInputError} Nếu ID không hợp lệ (code: INVALID_ID)
 * @throws {CountryInputError} Nếu không tìm thấy quốc gia (code: NOT_FOUND, status: 404)
 * 
 * @example
 * await deleteCountry(1); // Returns: true
 */
export async function deleteCountry(id) {
  // Parse và validate ID
  const countryId = Number.parseInt(id, 10);
  if (!Number.isInteger(countryId) || countryId <= 0) {
    throw createInputError('INVALID_ID', 'Country Id is not valid');
  }

  // Thực hiện xóa và kiểm tra số bản ghi bị xóa
  const deleted = await Country.destroy({ where: { id: countryId } });
  
  // Nếu không có bản ghi nào bị xóa, nghĩa là ID không tồn tại
  if (deleted === 0) {
    throw createInputError('NOT_FOUND', 'Country does not exist', 404);
  }
  return true;
}
