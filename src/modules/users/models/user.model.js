import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../../../common/db.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: true, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('user', 'moderator', 'admin'),
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  defaultScope: {
    attributes: { exclude: ['password'] },
  },
});

User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;
