/**
 * @fileoverview Teams Repository
 * @description Repository layer cho Team model, cung cấp các hàm truy vấn database.
 * Layer này tách biệt logic truy vấn database khỏi business logic trong service layer,
 * giúp code dễ maintain và test hơn.
 * 
 * @module modules/teams/repositories/team.repository
 * @requires sequelize - ORM framework, sử dụng Op cho các operator
 * @requires ../models/team.model.js - Sequelize Team model
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { Op } from 'sequelize';
import Team from '../models/team.model.js';

/**
 * Danh sách các attributes mặc định khi query Team
 * @constant {string[]}
 * @description Chỉ lấy các trường cần thiết để tối ưu performance
 */
const TEAM_ATTRIBUTES = ['id', 'name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id', 'created_at', 'updated_at'];

/**
 * Lấy danh sách teams với phân trang
 * 
 * @function paginateTeams
 * @description Query teams với pagination, hỗ trợ filter theo popularOnly.
 * Kết quả được sắp xếp theo tên đội bóng (A-Z).
 * 
 * @param {Object} options - Tham số phân trang
 * @param {number} options.page - Số trang (1-based)
 * @param {number} options.limit - Số records mỗi trang
 * @param {boolean} [options.popularOnly=false] - Chỉ lấy các đội bóng phổ biến
 * 
 * @returns {Promise<{rows: Team[], count: number}>} Object chứa danh sách teams và tổng số records
 * @returns {Team[]} returns.rows - Mảng các Team instances
 * @returns {number} returns.count - Tổng số records thỏa mãn điều kiện (dùng cho pagination)
 * 
 * @example
 * // Lấy trang 1, mỗi trang 20 teams
 * const { rows, count } = await paginateTeams({ page: 1, limit: 20 });
 * 
 * @example
 * // Lấy chỉ các đội bóng phổ biến
 * const { rows, count } = await paginateTeams({ page: 1, limit: 10, popularOnly: true });
 */
export function paginateTeams({ page, limit, popularOnly = false }) {
  // Tính offset dựa trên page number (1-based index)
  const offset = (page - 1) * limit;
  
  // Chỉ thêm điều kiện where nếu cần filter theo isPopular
  const where = popularOnly ? { isPopular: true } : undefined;

  return Team.findAndCountAll({
    where,
    attributes: TEAM_ATTRIBUTES,
    order: [['name', 'ASC']], // Sắp xếp theo tên từ A-Z
    limit,
    offset,
  });
}

/**
 * Tìm team theo ID
 * 
 * @function findTeamById
 * @description Tìm một team dựa trên primary key (ID).
 * 
 * @param {number} id - ID của team cần tìm
 * 
 * @returns {Promise<Team|null>} Team instance nếu tìm thấy, null nếu không
 * 
 * @example
 * const team = await findTeamById(33);
 * if (team) {
 *   console.log(team.name); // 'Manchester United'
 * }
 */
export function findTeamById(id) {
  return Team.findByPk(id, { attributes: TEAM_ATTRIBUTES });
}

/**
 * Tìm nhiều teams theo danh sách IDs
 * 
 * @function findTeamsByIds
 * @description Tìm nhiều teams cùng lúc dựa trên mảng IDs.
 * Kết quả được sắp xếp theo tên (A-Z).
 * 
 * @param {number[]} [ids=[]] - Mảng các team IDs cần tìm
 * 
 * @returns {Promise<Team[]>} Mảng các Team instances tìm thấy (có thể rỗng)
 * 
 * @example
 * const teams = await findTeamsByIds([33, 34, 40]);
 * // Returns: [{ id: 33, name: 'Manchester United', ... }, ...]
 */
export function findTeamsByIds(ids = []) {
  // Return mảng rỗng nếu không có IDs để tránh query không cần thiết
  if (!ids.length) {
    return [];
  }
  return Team.findAll({
    where: { id: { [Op.in]: ids } }, // Sử dụng IN operator cho nhiều IDs
    attributes: TEAM_ATTRIBUTES,
    order: [['name', 'ASC']],
  });
}

/**
 * Tìm kiếm teams theo tên
 * 
 * @function searchTeamsByName
 * @description Tìm kiếm teams với keyword trong tên (LIKE %keyword%).
 * Keyword cần được escape trước khi truyền vào để tránh SQL injection.
 * 
 * @param {string} keyword - Từ khóa tìm kiếm (đã được escape)
 * @param {number} limit - Số lượng kết quả tối đa trả về
 * 
 * @returns {Promise<Team[]>} Mảng các Team instances khớp với từ khóa
 * 
 * @example
 * // Tìm các đội có tên chứa "United"
 * const teams = await searchTeamsByName('United', 10);
 */
export function searchTeamsByName(keyword, limit) {
  return Team.findAll({
    where: {
      name: {
        [Op.like]: `%${keyword}%`, // Tìm kiếm substring bất kỳ vị trí
      },
    },
    attributes: TEAM_ATTRIBUTES,
    order: [['name', 'ASC']],
    limit,
  });
}

/**
 * Tạo team mới
 * 
 * @function createTeamRecord
 * @description Tạo một record team mới trong database.
 * 
 * @param {Object} payload - Dữ liệu team cần tạo
 * @param {number} [payload.id] - ID team (nếu có, dùng cho import từ API-Football)
 * @param {string} payload.name - Tên đội bóng (bắt buộc)
 * @param {string|null} [payload.code] - Mã viết tắt
 * @param {string|null} [payload.country] - Quốc gia
 * @param {number|null} [payload.founded] - Năm thành lập
 * @param {boolean} [payload.national=false] - Có phải đội tuyển quốc gia
 * @param {string|null} [payload.logo] - URL logo
 * @param {number|null} [payload.venue_id] - ID sân vận động
 * 
 * @returns {Promise<Team>} Team instance đã được tạo
 * 
 * @throws {SequelizeUniqueConstraintError} Nếu ID đã tồn tại
 * 
 * @example
 * const newTeam = await createTeamRecord({
 *   name: 'New Team FC',
 *   country: 'Vietnam',
 *   founded: 2020
 * });
 */
export function createTeamRecord(payload) {
  return Team.create(payload);
}

/**
 * Cập nhật team theo ID
 * 
 * @function updateTeamRecord
 * @description Cập nhật thông tin team dựa trên ID.
 * 
 * @param {number} id - ID của team cần cập nhật
 * @param {Object} payload - Các trường cần cập nhật
 * 
 * @returns {Promise<[number]>} Mảng chứa số lượng records đã được cập nhật
 * 
 * @example
 * const [affectedCount] = await updateTeamRecord(33, { name: 'Man United' });
 * if (affectedCount === 0) {
 *   console.log('Team not found');
 * }
 */
export function updateTeamRecord(id, payload) {
  return Team.update(payload, { where: { id } });
}

/**
 * Xóa team theo ID
 * 
 * @function deleteTeamRecord
 * @description Xóa một team khỏi database (hard delete).
 * 
 * @param {number} id - ID của team cần xóa
 * 
 * @returns {Promise<number>} Số lượng records đã bị xóa (0 hoặc 1)
 * 
 * @example
 * const deletedCount = await deleteTeamRecord(33);
 * if (deletedCount === 0) {
 *   console.log('Team not found');
 * }
 */
export function deleteTeamRecord(id) {
  return Team.destroy({ where: { id } });
}

/**
 * Bulk upsert teams
 * 
 * @function bulkUpsertTeams
 * @description Import nhiều teams cùng lúc với logic upsert (insert hoặc update nếu đã tồn tại).
 * Dùng cho việc đồng bộ dữ liệu từ API-Football.
 * 
 * @param {Object[]} teamPayloads - Mảng các team objects cần upsert
 * @param {number} teamPayloads[].id - ID team (bắt buộc, dùng để xác định conflict)
 * @param {string} teamPayloads[].name - Tên đội bóng
 * @param {string|null} [teamPayloads[].code] - Mã viết tắt
 * @param {string|null} [teamPayloads[].country] - Quốc gia
 * @param {number|null} [teamPayloads[].founded] - Năm thành lập
 * @param {boolean} [teamPayloads[].national] - Đội tuyển quốc gia
 * @param {string|null} [teamPayloads[].logo] - URL logo
 * @param {number|null} [teamPayloads[].venue_id] - ID sân vận động
 * 
 * @returns {Promise<Team[]>} Mảng các Team instances đã được tạo/cập nhật
 * 
 * @example
 * const teams = await bulkUpsertTeams([
 *   { id: 33, name: 'Manchester United', country: 'England' },
 *   { id: 34, name: 'Newcastle', country: 'England' }
 * ]);
 */
export function bulkUpsertTeams(teamPayloads) {
  return Team.bulkCreate(teamPayloads, {
    // Các trường sẽ được cập nhật nếu record đã tồn tại (conflict on id)
    updateOnDuplicate: ['name', 'code', 'country', 'founded', 'national', 'logo', 'venue_id'],
  });
}
