import mysql from 'mysql2';
import fs from 'fs';
import 'dotenv/config';

// TiDB Cloud yêu cầu kết nối TLS
const sslConfig = process.env.DB_SSL_CA_PATH
  ? { ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8') }
  : undefined;

// Tạo kết nối MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: sslConfig
});

// Kết nối đến database
db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối MySQL:', err);
    return;
  }
  console.log('Đã kết nối thành công đến MySQL database');
});

export default db;