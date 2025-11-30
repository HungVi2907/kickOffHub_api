import { Sequelize } from 'sequelize';
import fs from 'fs';
import 'dotenv/config';

const dialectOptions = {};
const caPath = process.env.DB_SSL_CA_PATH ? process.env.DB_SSL_CA_PATH.trim() : '';
if (caPath) {
  try {
    dialectOptions.ssl = {
      ca: fs.readFileSync(caPath, 'utf8'),
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    };
  } catch (err) {
    console.warn(`Không thể đọc file CA tại ${caPath}: ${err.message}`);
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

try {
  await sequelize.authenticate();
  console.log('Kết nối Sequelize đến MySQL thành công.');
} catch (error) {
  console.error('Lỗi kết nối Sequelize:', error);
}

export default sequelize;
export { sequelize };
