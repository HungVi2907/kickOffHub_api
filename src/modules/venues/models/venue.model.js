import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

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
