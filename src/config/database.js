import { Sequelize } from 'sequelize';
import fs from 'fs';
import 'dotenv/config';

// Chuẩn bị cấu hình SSL nếu TiDB yêu cầu chứng chỉ
const dialectOptions = {};
const caPath = process.env.DB_SSL_CA_PATH ? process.env.DB_SSL_CA_PATH.trim() : '';
if (caPath) {
  try {
    dialectOptions.ssl = {
      ca: fs.readFileSync(caPath, 'utf8'),
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    };
  } catch (err) {
    console.warn(`Không thể đọc file CA tại ${caPath}: ${err.message}`);
  }
}

// Cấu hình Sequelize với MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions,
    logging: false, // Tắt logging SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test kết nối
try {
  await sequelize.authenticate();
  console.log('Kết nối Sequelize đến MySQL thành công.');
} catch (error) {
  console.error('Lỗi kết nối Sequelize:', error);
}

export default sequelize;