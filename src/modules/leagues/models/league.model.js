import { DataTypes } from 'sequelize';
import sequelize from '../../../common/db.js';

const League = sequelize.define('League', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
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
