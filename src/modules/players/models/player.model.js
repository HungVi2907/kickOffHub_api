import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  firstname: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  lastname: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  birth_place: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  birth_country: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  nationality: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  height: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  weight: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING(1024),
    allowNull: true,
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'isPopular',
  },
}, {
  tableName: 'players',
  underscored: true,
  timestamps: false,
});

export default Player;
