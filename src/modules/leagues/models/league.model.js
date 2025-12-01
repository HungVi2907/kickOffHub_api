/**
 * @fileoverview League Model Definition
 * @description Sequelize model for the leagues table. Represents football/soccer
 * leagues with their metadata including name, type, and logo.
 * @module modules/leagues/models/league
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

/**
 * League Model
 * @typedef {Object} LeagueAttributes
 * @property {number} id - Unique league identifier (primary key)
 * @property {string} name - League name (unique)
 * @property {string|null} type - League type (e.g., 'League', 'Cup')
 * @property {string|null} logo - URL to the league's logo image
 * @property {Date} created_at - Record creation timestamp
 * @property {Date} updated_at - Record last update timestamp
 */

/**
 * Sequelize model representing a football/soccer league.
 * @type {import('sequelize').Model<LeagueAttributes>}
 */
const League = sequelize.define('League', {
  /**
   * Unique identifier for the league
   * @type {number}
   */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  /**
   * Name of the league (must be unique)
   * @type {string}
   */
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  /**
   * Type of competition (e.g., 'League', 'Cup', 'Super Cup')
   * @type {string|null}
   */
  type: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  /**
   * URL to the league's logo image
   * @type {string|null}
   */
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'leagues',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default League;
