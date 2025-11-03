import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Định nghĩa model Country với Sequelize
const Country = sequelize.define('Country', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  flag: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'countries', // Tên bảng trong DB
  timestamps: true, // Tự động thêm createdAt và updatedAt
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Country;