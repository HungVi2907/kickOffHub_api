/**
 * @file Season Model Definition
 * @description Defines the Sequelize model for the seasons table.
 * Represents a football/soccer season year.
 * @module modules/seasons/models/season
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

/**
 * Season Model
 * @description Represents a single season entry in the database.
 * Uses the season year as the primary key (e.g., 2024, 2023).
 *
 * @typedef {Object} SeasonAttributes
 * @property {number} season - The season year (primary key, e.g., 2024).
 */

/**
 * Sequelize model for the 'seasons' table.
 * @type {import('sequelize').Model}
 */
const Season = sequelize.define('Season', {
  /**
   * The season year value.
   * @type {number}
   * @description Integer representing the season year (e.g., 2024).
   *              Serves as the primary key for the table.
   */
  season: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
}, {
  tableName: 'seasons',
  timestamps: false, // No createdAt/updatedAt columns
});

export default Season;
