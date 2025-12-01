/**
 * @fileoverview Country Model - Sequelize Model Definition
 * Định nghĩa model Country đại diện cho bảng 'countries' trong database.
 * 
 * Model này lưu trữ thông tin về các quốc gia trong hệ thống bóng đá,
 * bao gồm tên, mã quốc gia (ISO code) và đường dẫn cờ quốc gia.
 * 
 * @module modules/countries/models/country.model
 * @requires sequelize
 * @requires ../../../common/db.js
 * 
 * @author KickOffHub Team
 * @version 1.0.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

/**
 * @typedef {Object} CountryAttributes
 * @property {number} id - ID tự động tăng của quốc gia (Primary Key)
 * @property {string} name - Tên quốc gia (bắt buộc, duy nhất)
 * @property {string|null} code - Mã ISO quốc gia (tối đa 10 ký tự, ví dụ: 'VN', 'ENG')
 * @property {string|null} flag - URL hình ảnh cờ quốc gia
 * @property {boolean} is_popular - Đánh dấu quốc gia nổi bật (mặc định: false)
 * @property {Date} created_at - Thời điểm tạo bản ghi
 * @property {Date} updated_at - Thời điểm cập nhật bản ghi gần nhất
 */

/**
 * Country Model - Sequelize model đại diện cho bảng countries.
 * 
 * @type {import('sequelize').Model<CountryAttributes>}
 * 
 * @example
 * // Tạo quốc gia mới
 * const vietnam = await Country.create({
 *   name: 'Vietnam',
 *   code: 'VN',
 *   flag: 'https://example.com/flags/vn.png'
 * });
 * 
 * @example
 * // Tìm quốc gia theo ID
 * const country = await Country.findByPk(1);
 * 
 * @example
 * // Tìm quốc gia theo tên
 * const england = await Country.findOne({ where: { name: 'England' } });
 */
const Country = sequelize.define(
  'Country',
  {
    /**
     * ID quốc gia - Primary Key, tự động tăng
     * @type {number}
     */
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    /**
     * Tên quốc gia - Bắt buộc và phải duy nhất trong hệ thống
     * @type {string}
     */
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    /**
     * Mã ISO quốc gia (ví dụ: 'VN', 'ENG', 'USA')
     * Tối đa 10 ký tự, có thể null
     * @type {string|null}
     */
    code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    /**
     * URL đường dẫn đến hình ảnh cờ quốc gia
     * Thường lấy từ API-Football hoặc nguồn bên ngoài
     * @type {string|null}
     */
    flag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    /**
     * Đánh dấu quốc gia nổi bật/phổ biến
     * Sử dụng để lọc và hiển thị các quốc gia được quan tâm nhiều
     * @type {boolean}
     */
    is_popular: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    // Tên bảng trong database
    tableName: 'countries',
    // Bật timestamps tự động
    timestamps: true,
    // Map tên cột theo convention snake_case
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export default Country;
