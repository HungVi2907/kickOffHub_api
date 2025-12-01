/**
 * =============================================================================
 * FILE: src/modules/players/models/player.model.js
 * =============================================================================
 * 
 * @fileoverview Sequelize Player Model Definition
 * 
 * @description
 * Định nghĩa Sequelize model cho bảng players.
 * Lưu thông tin cầu thủ từ API-Football.
 * 
 * ## Table: players
 * | Column        | Type         | Nullable | Notes              |
 * |---------------|--------------|----------|--------------------|
 * | id            | INT          | No       | PK, từ API-Football|
 * | name          | VARCHAR(255) | Yes      | Full name          |
 * | firstname     | VARCHAR(255) | Yes      |                    |
 * | lastname      | VARCHAR(255) | Yes      |                    |
 * | age           | INT          | Yes      |                    |
 * | birth_date    | DATE         | Yes      |                    |
 * | birth_place   | VARCHAR(255) | Yes      |                    |
 * | birth_country | VARCHAR(255) | Yes      |                    |
 * | nationality   | VARCHAR(255) | Yes      |                    |
 * | height        | VARCHAR(20)  | Yes      | e.g., '180 cm'     |
 * | weight        | VARCHAR(20)  | Yes      | e.g., '75 kg'      |
 * | number        | INT          | Yes      | Jersey number      |
 * | position      | VARCHAR(100) | Yes      | GK/DF/MF/FW        |
 * | photo         | VARCHAR(1024)| Yes      | Photo URL          |
 * | isPopular     | BOOLEAN      | No       | Featured flag      |
 * 
 * @module modules/players/models/player.model
 * @requires sequelize
 * @exports {Model} Player - Sequelize Player model
 * 
 * =============================================================================
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

// =============================================================================
// Model Definition
// =============================================================================

/**
 * Sequelize Player model.
 * 
 * @type {import('sequelize').Model}
 */
const Player = sequelize.define('Player', {
  /** Player ID từ API-Football (không auto-increment) */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: false,
  },
  /** Full name của cầu thủ */
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  /** Tên (first name) */
  firstname: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  /** Họ (last name) */
  lastname: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  /** Tuổi hiện tại */
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  /** Ngày sinh */
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  /** Nơi sinh */
  birth_place: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  /** Quốc gia sinh */
  birth_country: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  /** Quốc tịch */
  nationality: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  /** Chiều cao (e.g., '180 cm') */
  height: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  /** Cân nặng (e.g., '75 kg') */
  weight: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  /** Số áo */
  number: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  /** Vị trí thi đấu: Goalkeeper, Defender, Midfielder, Attacker */
  position: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  /** URL ảnh cầu thủ */
  photo: {
    type: DataTypes.STRING(1024),
    allowNull: true,
  },
  /** Flag đánh dấu cầu thủ nổi tiếng */
  isPopular: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'isPopular',
  },
}, {
  tableName: 'players',
  underscored: true,    // Chuyển camelCase sang snake_case
  timestamps: false,    // Không có created_at/updated_at
});

export default Player;
