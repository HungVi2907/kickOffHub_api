import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  founded: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  national: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
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
  isPopular: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'teams',
  underscored: true,
  timestamps: true,
});

export default Team;
