import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Sequelize model for the seasons table
const Season = sequelize.define('Season', {
  season: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  tableName: 'seasons',
  timestamps: false
});

export default Season;
