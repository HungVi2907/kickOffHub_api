import 'dotenv/config'
import sequelize from './src/config/database.js'
import app from './src/app.js'
import { ensurePopularFlagColumn } from './src/utils/ensureTeamsSchema.js'
import { ensurePostImageColumn } from './src/utils/ensurePostsSchema.js'

const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    await ensurePopularFlagColumn()
    await sequelize.sync()
    await ensurePostImageColumn()
    console.log('Database synced successfully.')
    app.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`)
    })
  } catch (error) {
    console.error('Unable to initialize database schema:', error)
    process.exit(1)
  }
}

startServer()
