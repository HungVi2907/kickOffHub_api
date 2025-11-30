import 'dotenv/config'
import sequelize from './src/config/database.js'
import app from './src/app.js'
import { connectRedis } from './src/lib/redisClient.js'
import { ensurePopularFlagColumn } from './src/utils/ensureTeamsSchema.js'
import { ensurePostImageColumn } from './src/utils/ensurePostsSchema.js'

const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    // Sync các schema cần thiết
    await ensurePopularFlagColumn()
    await sequelize.sync()
    await ensurePostImageColumn()
    await connectRedis().catch((err) => {
      console.warn('Unable to connect to Redis during startup:', err.message)
    })

    console.log('Database synced successfully.')

    // Chạy server
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`)
    })

  } catch (error) {
    console.error('Unable to initialize database schema:', error)
    process.exit(1)
  }
}

startServer()
