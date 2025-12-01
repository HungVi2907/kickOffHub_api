/**
 * =============================================================================
 * FILE: server.js
 * =============================================================================
 * 
 * @fileoverview Entry point chính của Kick Off Hub API Server
 * 
 * @description
 * File này là điểm khởi đầu của ứng dụng backend. Nó chịu trách nhiệm:
 * - Load biến môi trường từ file .env
 * - Khởi tạo kết nối database (MySQL/TiDB thông qua Sequelize)
 * - Đảm bảo schema database được cập nhật (migration columns)
 * - Kết nối Redis cho caching và queues
 * - Khởi động Express server
 * 
 * @module server
 * @requires dotenv/config - Load biến môi trường
 * @requires ./src/config/database.js - Sequelize instance
 * @requires ./src/app.js - Express application
 * @requires ./src/lib/redisClient.js - Redis connection
 * @requires ./src/utils/ensureTeamsSchema.js - Schema migration cho teams
 * @requires ./src/utils/ensurePostsSchema.js - Schema migration cho posts
 * 
 * @example
 * // Chạy server
 * npm start
 * 
 * // Chạy với nodemon (development)
 * npm run dev
 * 
 * =============================================================================
 */

import 'dotenv/config'
import sequelize from './src/config/database.js'
import app from './src/app.js'
import { connectRedis } from './src/lib/redisClient.js'
import { ensurePopularFlagColumn } from './src/utils/ensureTeamsSchema.js'
import { ensurePostImageColumn } from './src/utils/ensurePostsSchema.js'

/**
 * Port server sẽ lắng nghe
 * @constant {number}
 * @default 3000
 */
const PORT = process.env.PORT || 3000

/**
 * Khởi động server và thiết lập các kết nối cần thiết
 * 
 * @async
 * @function startServer
 * @description
 * Hàm này thực hiện các bước khởi động server theo thứ tự:
 * 1. Đảm bảo cột is_popular tồn tại trong bảng teams
 * 2. Sync Sequelize models với database
 * 3. Đảm bảo cột image_url tồn tại trong bảng posts
 * 4. Kết nối Redis (không bắt buộc - fallback gracefully nếu thất bại)
 * 5. Khởi động Express server lắng nghe requests
 * 
 * @throws {Error} Nếu không thể khởi tạo database schema
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    // =========================================================================
    // BƯỚC 1: Schema Migration - Đảm bảo các cột cần thiết tồn tại
    // =========================================================================
    // Kiểm tra và thêm cột is_popular cho bảng teams nếu chưa có
    await ensurePopularFlagColumn()
    
    // Đồng bộ tất cả Sequelize models với database
    // Điều này tạo các bảng nếu chưa tồn tại và cập nhật schema
    await sequelize.sync()
    
    // Kiểm tra và thêm cột image_url cho bảng posts nếu chưa có
    await ensurePostImageColumn()
    
    // =========================================================================
    // BƯỚC 2: Kết nối Redis (Optional)
    // =========================================================================
    // Redis được sử dụng cho caching và job queues
    // Nếu kết nối thất bại, server vẫn chạy nhưng không có caching
    await connectRedis().catch((err) => {
      console.warn('Unable to connect to Redis during startup:', err.message)
    })

    console.log('Database synced successfully.')

    // =========================================================================
    // BƯỚC 3: Khởi động Express Server
    // =========================================================================
    // Bắt đầu lắng nghe HTTP requests trên port được cấu hình
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`)
    })

  } catch (error) {
    // Nếu không thể khởi tạo database, thoát ứng dụng với mã lỗi
    console.error('Unable to initialize database schema:', error)
    process.exit(1)
  }
}

// Khởi động server
startServer()
