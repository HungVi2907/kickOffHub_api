/**
 * @file Venue Model Definition
 * @description Sequelize model for the venues table. Represents stadiums/venues
 * where football matches are played, typically imported from API-Football.
 * @module modules/venues/models/venue
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

/**
 * Venue model representing a football stadium/venue.
 * @typedef {Object} Venue
 * @property {number} id - Primary key (from API-Football)
 * @property {string|null} name - Venue name
 * @property {string|null} address - Street address
 * @property {string|null} city - City where venue is located
 * @property {number|null} capacity - Seating capacity
 * @property {string|null} surface - Playing surface type (grass, artificial, etc.)
 * @property {string|null} image - URL to venue image
 * @property {Date} created_at - Timestamp when the record was created
 * @property {Date} updated_at - Timestamp when the record was last updated
 */
const Venue = sequelize.define('Venue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  surface: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'venues',
  underscored: true,
  timestamps: true,
});

export default Venue;
