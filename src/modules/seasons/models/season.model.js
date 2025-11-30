import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

const Season = sequelize.define('Season', {
  season: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
}, {
  tableName: 'seasons',
  timestamps: false,
});

export default Season;
