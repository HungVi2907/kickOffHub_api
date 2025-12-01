/**
 * @fileoverview Team Model Definition
 * @description Định nghĩa Sequelize model cho bảng teams trong database.
 * Model này đại diện cho các đội bóng trong hệ thống, bao gồm thông tin
 * cơ bản như tên, mã code, quốc gia, năm thành lập, logo và liên kết với venue (sân vận động).
 * 
 * @module modules/teams/models/team.model
 * @requires sequelize - ORM framework cho Node.js
 * @requires ../../../common/db.js - Database connection instance
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

/**
 * @typedef {Object} TeamAttributes
 * @property {number} id - ID đội bóng (từ API-Football, không tự động tăng)
 * @property {string} name - Tên đội bóng (bắt buộc)
 * @property {string|null} code - Mã viết tắt của đội (VD: MUN, RMA)
 * @property {string|null} country - Quốc gia của đội bóng
 * @property {number|null} founded - Năm thành lập đội bóng
 * @property {boolean} national - Có phải đội tuyển quốc gia không
 * @property {string|null} logo - URL logo đội bóng
 * @property {number|null} venue_id - ID sân vận động (foreign key đến bảng venues)
 * @property {boolean} isPopular - Đội bóng có phổ biến/nổi tiếng không
 * @property {Date} created_at - Thời gian tạo record
 * @property {Date} updated_at - Thời gian cập nhật record
 */

/**
 * Sequelize Model: Team
 * 
 * @description Model đại diện cho đội bóng trong hệ thống.
 * ID không tự động tăng vì sử dụng ID từ API-Football để đảm bảo tính nhất quán
 * khi đồng bộ dữ liệu từ external API.
 * 
 * @type {import('sequelize').Model<TeamAttributes>}
 * 
 * @example
 * // Tạo đội bóng mới
 * const team = await Team.create({
 *   id: 33,
 *   name: 'Manchester United',
 *   code: 'MUN',
 *   country: 'England',
 *   founded: 1878,
 *   national: false,
 *   logo: 'https://example.com/logo.png',
 *   venue_id: 556,
 *   isPopular: true
 * });
 * 
 * @example
 * // Tìm đội bóng theo ID
 * const team = await Team.findByPk(33);
 */
const Team = sequelize.define('Team', {
  /**
   * ID đội bóng - Primary Key
   * @description ID lấy từ API-Football, không tự động tăng để đảm bảo
   * tính nhất quán khi đồng bộ dữ liệu
   */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    allowNull: false,
  },
  /**
   * Tên đội bóng
   * @description Tên chính thức của đội bóng (bắt buộc)
   */
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  /**
   * Mã viết tắt
   * @description Mã ngắn gọn của đội (VD: MUN cho Manchester United)
   */
  code: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  /**
   * Quốc gia
   * @description Tên quốc gia mà đội bóng thuộc về
   */
  country: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  /**
   * Năm thành lập
   * @description Năm đội bóng được thành lập
   */
  founded: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  /**
   * Đội tuyển quốc gia
   * @description True nếu đây là đội tuyển quốc gia, false nếu là CLB
   */
  national: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  /**
   * Logo URL
   * @description Đường dẫn đến hình ảnh logo của đội bóng
   */
  logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  /**
   * Venue ID - Foreign Key
   * @description Liên kết đến bảng venues, xác định sân nhà của đội
   * Khi venue bị xóa, field này sẽ được SET NULL
   */
  venue_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'venues',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  /**
   * Đội bóng phổ biến
   * @description Đánh dấu các đội bóng nổi tiếng để hiển thị ưu tiên
   */
  isPopular: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  /** Tên bảng trong database */
  tableName: 'teams',
  /** Sử dụng snake_case cho tên cột (created_at, updated_at thay vì createdAt, updatedAt) */
  underscored: true,
  /** Tự động thêm created_at và updated_at */
  timestamps: true,
});

export default Team;
