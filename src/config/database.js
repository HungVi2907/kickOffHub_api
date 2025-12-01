/**
 * =============================================================================
 * FILE: src/config/database.js
 * =============================================================================
 * 
 * @fileoverview Sequelize ORM Database Configuration
 * 
 * @description
 * Cấu hình Sequelize ORM cho kết nối MySQL/TiDB Cloud.
 * Hỗ trợ SSL/TLS connection với custom CA certificate.
 * 
 * ## Environment Variables:
 * - DB_HOST: Database host address
 * - DB_PORT: Database port (default MySQL: 3306, TiDB: 4000)
 * - DB_NAME: Database name
 * - DB_USER: Database username
 * - DB_PASSWORD: Database password
 * - DB_SSL_CA_PATH: (Optional) Path to SSL CA certificate file
 * 
 * ## Connection Pool Settings:
 * - max: 5 connections
 * - min: 0 connections
 * - acquire: 30s timeout to get connection
 * - idle: 10s before releasing idle connection
 * 
 * ## SSL/TLS:
 * - Tự động enable SSL nếu DB_SSL_CA_PATH được set
 * - Requires TLS 1.2+
 * - rejectUnauthorized: true (verify certificate)
 * 
 * @module config/database
 * @requires sequelize
 * @exports {Sequelize} sequelize - Sequelize instance đã kết nối
 * 
 * =============================================================================
 */

import { Sequelize } from 'sequelize';
import fs from 'fs';
import 'dotenv/config';

// =============================================================================
// SSL Configuration
// =============================================================================

/**
 * Dialect options cho Sequelize.
 * Chứa SSL config nếu DB_SSL_CA_PATH được cung cấp.
 * @type {Object}
 */
const dialectOptions = {};

/**
 * Path tới SSL CA certificate file.
 * Dùng cho kết nối TiDB Cloud hoặc MySQL với SSL.
 * @type {string}
 */
const caPath = process.env.DB_SSL_CA_PATH ? process.env.DB_SSL_CA_PATH.trim() : '';

if (caPath) {
  try {
    // Cấu hình SSL với CA certificate
    dialectOptions.ssl = {
      ca: fs.readFileSync(caPath, 'utf8'),  // Đọc CA cert từ file
      rejectUnauthorized: true,               // Verify server certificate
      minVersion: 'TLSv1.2'                   // Minimum TLS version
    };
  } catch (err) {
    console.warn(`Không thể đọc file CA tại ${caPath}: ${err.message}`);
  }
}

// =============================================================================
// Sequelize Instance
// =============================================================================

/**
 * Sequelize instance với MySQL/TiDB configuration.
 * 
 * @type {Sequelize}
 * @property {string} database - Database name
 * @property {string} username - Database user
 * @property {string} password - Database password
 * @property {Object} options - Sequelize options
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions,
    logging: false, // Tắt logging SQL queries
    pool: {
      max: 5,       // Maximum connections trong pool
      min: 0,       // Minimum connections trong pool
      acquire: 30000, // Timeout (ms) để acquire connection
      idle: 10000     // Thời gian (ms) trước khi release idle connection
    }
  }
);

// =============================================================================
// Connection Test
// =============================================================================

// Test kết nối khi module được load
try {
  await sequelize.authenticate();
  console.log('Kết nối Sequelize đến MySQL thành công.');
} catch (error) {
  console.error('Lỗi kết nối Sequelize:', error);
}

export default sequelize;