/**
 * =============================================================================
 * FILE: src/common/db.js
 * =============================================================================
 * 
 * @fileoverview Sequelize Database Connection - Main Database Module
 * 
 * @description
 * File này thiết lập và export Sequelize instance cho kết nối MySQL/TiDB.
 * Được sử dụng làm primary database connection trong toàn bộ application.
 * 
 * ## Cấu hình qua Environment Variables:
 * 
 * | Variable        | Description                          | Required |
 * |-----------------|--------------------------------------|----------|
 * | DB_NAME         | Tên database                         | Yes      |
 * | DB_USER         | Database username                    | Yes      |
 * | DB_PASSWORD     | Database password                    | Yes      |
 * | DB_HOST         | Database host                        | Yes      |
 * | DB_PORT         | Database port (default: 3306)        | No       |
 * | DB_SSL_CA_PATH  | Path tới CA certificate (TiDB Cloud) | No       |
 * 
 * ## SSL Support:
 * Hỗ trợ kết nối SSL cho TiDB Cloud hoặc các databases yêu cầu TLS.
 * Cung cấp DB_SSL_CA_PATH để enable SSL với CA certificate.
 * 
 * ## Connection Pool:
 * - Max connections: 5
 * - Min connections: 0
 * - Acquire timeout: 30 seconds
 * - Idle timeout: 10 seconds
 * 
 * @module common/db
 * @requires sequelize
 * @requires fs
 * @requires dotenv/config
 * 
 * =============================================================================
 */

import { Sequelize } from 'sequelize';
import fs from 'fs';
import 'dotenv/config';

// =============================================================================
// SSL CONFIGURATION
// =============================================================================

/**
 * Dialect options cho Sequelize
 * Bao gồm SSL config nếu được cấu hình
 * @type {Object}
 */
const dialectOptions = {};

/**
 * Đường dẫn tới CA certificate cho SSL connection
 * Được sử dụng khi kết nối tới TiDB Cloud hoặc các databases yêu cầu TLS
 * @type {string}
 */
const caPath = process.env.DB_SSL_CA_PATH ? process.env.DB_SSL_CA_PATH.trim() : '';

// Cấu hình SSL nếu có CA certificate path
if (caPath) {
  try {
    dialectOptions.ssl = {
      ca: fs.readFileSync(caPath, 'utf8'),  // Đọc CA certificate
      rejectUnauthorized: true,              // Reject self-signed certificates
      minVersion: 'TLSv1.2',                 // Minimum TLS version
    };
  } catch (err) {
    console.warn(`Không thể đọc file CA tại ${caPath}: ${err.message}`);
  }
}

// =============================================================================
// SEQUELIZE INSTANCE
// =============================================================================

/**
 * Sequelize instance - Main database connection
 * 
 * @type {Sequelize}
 * @description
 * Instance này được sử dụng để:
 * - Define models (sequelize.define)
 * - Thực hiện raw queries (sequelize.query)
 * - Transaction management (sequelize.transaction)
 * - Database synchronization (sequelize.sync)
 * 
 * @example
 * import sequelize from './common/db.js';
 * 
 * // Sử dụng trong model
 * const User = sequelize.define('User', { ... });
 * 
 * // Raw query
 * const results = await sequelize.query('SELECT * FROM users');
 * 
 * // Transaction
 * await sequelize.transaction(async (t) => {
 *   await User.create({ name: 'John' }, { transaction: t });
 * });
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Database name
  process.env.DB_USER,      // Username
  process.env.DB_PASSWORD,  // Password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions,
    logging: false,  // Tắt SQL logging (bật: console.log hoặc custom function)
    pool: {
      max: 5,         // Số connection tối đa trong pool
      min: 0,         // Số connection tối thiểu
      acquire: 30000, // Timeout khi acquire connection (ms)
      idle: 10000,    // Thời gian connection idle trước khi release (ms)
    },
  },
);

// =============================================================================
// CONNECTION TEST
// =============================================================================

/**
 * Test database connection khi module được load
 * Giúp phát hiện lỗi connection sớm trong quá trình khởi động
 */
try {
  await sequelize.authenticate();
  console.log('Kết nối Sequelize đến MySQL thành công.');
} catch (error) {
  console.error('Lỗi kết nối Sequelize:', error);
}

export default sequelize;
export { sequelize };
