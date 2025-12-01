/**
 * =============================================================================
 * FILE: src/config/db.js
 * =============================================================================
 * 
 * @fileoverview MySQL2 Raw Database Connection
 * 
 * @description
 * Cấu hình kết nối MySQL sử dụng mysql2 driver trực tiếp.
 * Dùng cho các trường hợp cần raw queries thay vì ORM.
 * 
 * ## Sự khác biệt với database.js:
 * - database.js: Sequelize ORM với connection pool
 * - db.js: mysql2 raw connection cho simple queries
 * 
 * ## Environment Variables:
 * - DB_HOST: Database host
 * - DB_PORT: Database port
 * - DB_NAME: Database name
 * - DB_USER: Database username  
 * - DB_PASSWORD: Database password
 * - DB_SSL_CA_PATH: (Optional) SSL CA certificate path
 * 
 * ## Use Cases:
 * - Raw SQL queries không cần ORM
 * - Legacy code hoặc simple operations
 * - Direct database access
 * 
 * @module config/db
 * @requires mysql2
 * @exports {mysql.Connection} db - MySQL connection instance
 * 
 * @deprecated Prefer using Sequelize từ config/database.js cho ORM features
 * 
 * =============================================================================
 */

import mysql from 'mysql2';
import fs from 'fs';
import 'dotenv/config';

// =============================================================================
// SSL Configuration
// =============================================================================

/**
 * SSL configuration cho TiDB Cloud hoặc MySQL với TLS.
 * Chỉ enable nếu DB_SSL_CA_PATH được cung cấp.
 * @type {Object|undefined}
 */
const sslConfig = process.env.DB_SSL_CA_PATH
  ? { ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8') }
  : undefined;

// =============================================================================
// MySQL Connection
// =============================================================================

/**
 * MySQL connection instance sử dụng mysql2 driver.
 * 
 * @type {mysql.Connection}
 * @property {string} host - Database host
 * @property {string} user - Database username
 * @property {string} database - Database name
 * @property {number} port - Database port
 * @property {Object} ssl - SSL configuration (optional)
 */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: sslConfig
});

// =============================================================================
// Connection Initialization
// =============================================================================

// Kết nối đến database khi module được load
db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối MySQL:', err);
    return;
  }
  console.log('Đã kết nối thành công đến MySQL database');
});

export default db;